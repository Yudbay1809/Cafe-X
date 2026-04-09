import 'package:flutter/material.dart';
import 'dart:async';

import '../../core/local_db.dart';
import '../../core/app_config_service.dart';
import '../../core/security_utils.dart';
import '../../features/order/order_models.dart';
import '../../pos_app_service.dart';
import '../ui_utils.dart';
import '../widgets/section_card.dart';

class OrderScreen extends StatefulWidget {
  const OrderScreen({super.key, required this.services, required this.onChanged});

  final PosAppService services;
  final VoidCallback onChanged;

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  String? _currentOrderLocalId;
  String? _selectedTable;
  String? _selectedCategory;
  String _search = '';
  List<Map<String, Object?>> _allProducts = [];
  List<Map<String, Object?>> _products = [];
  List<Map<String, Object?>> _tables = [];
  List<PosOrderItem> _items = [];
  double _total = 0;
  double _discount = 0;
  String _status = '';
  bool _loading = false;
  bool _refreshingMenu = false;
  String _menuStatus = '';
  final _config = AppConfigService();
  StreamSubscription<String>? _shortcutSub;

  @override
  void initState() {
    super.initState();
    _loadTables();
    _loadProducts();
    _refreshMaster();
    _shortcutSub = widget.services.shortcutBus.stream.listen((action) {
      if (action == 'new_order') {
        setState(() {
          _currentOrderLocalId = null;
          _items = [];
          _total = 0;
          _discount = 0;
        });
      }
    });
  }

  @override
  void dispose() {
    _shortcutSub?.cancel();
    super.dispose();
  }

  Future<void> _loadTables() async {
    final tables = await widget.services.cacheService.activeTables();
    if (!mounted) return;
    setState(() => _tables = tables);
  }

  Future<void> _refreshMaster() async {
    if (_refreshingMenu) return;
    setState(() {
      _refreshingMenu = true;
      _menuStatus = '';
    });
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      await widget.services.cacheService.refreshMaster(token: session.accessToken);
      await _loadTables();
      await _loadProducts();
      if (!mounted) return;
      setState(() => _menuStatus = 'Menu diperbarui');
    } catch (_) {
      if (!mounted) return;
      setState(() => _menuStatus = 'Gagal update menu, pakai cache');
    } finally {
      if (mounted) setState(() => _refreshingMenu = false);
    }
  }

  Future<void> _loadProducts() async {
    _allProducts = await widget.services.cacheService.allProducts();
    _applyFilters();
  }

  void _applyFilters() {
    final search = _search.trim().toLowerCase();
    final category = _selectedCategory;
    final products = _allProducts.where((p) {
      final name = p['name']?.toString().toLowerCase() ?? '';
      final cat = p['category']?.toString() ?? '';
      final matchSearch = search.isEmpty || name.contains(search) || cat.toLowerCase().contains(search);
      final matchCategory = category == null || category == 'All' || cat == category;
      return matchSearch && matchCategory;
    }).toList();
    if (!mounted) return;
    setState(() => _products = products);
  }

  Future<void> _loadItems() async {
    final id = _currentOrderLocalId;
    if (id == null) return;
    final items = await widget.services.orderService.items(id);
    final detail = await widget.services.orderService.detail(id);
    if (!mounted) return;
    setState(() {
      _items = items;
      _total = detail?.totalAmount ?? 0;
    });
  }

  Future<void> _createOrderIfNeeded() async {
    if (_currentOrderLocalId != null) return;
    final session = await widget.services.authService.currentSession();
    if (session == null) throw StateError('Belum login');
    if (_selectedTable == null) throw StateError('Pilih meja dulu');
    final localId = await widget.services.orderService.createOrder(
      token: session.accessToken,
      actor: session.username,
      roleName: session.roleName,
      source: 'POS',
      tableCode: _selectedTable,
      note: 'pos-order',
    );
    setState(() => _currentOrderLocalId = localId);
    await _loadItems();
  }

  Future<void> _addItem(Map<String, Object?> p) async {
    setState(() {
      _loading = true;
      _status = '';
    });
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      await _createOrderIfNeeded();
      final productId = (p['id_menu'] as num).toInt();
      if (!mounted) return;
      final note = await promptText(context, title: 'Catatan Item', hint: 'Optional');
      if (!mounted) return;
      await widget.services.orderService.addItem(
        token: session.accessToken,
        actor: session.username,
        roleName: session.roleName,
        orderLocalId: _currentOrderLocalId!,
        productId: productId,
        qty: 1,
        note: note,
      );
      await _loadItems();
      widget.onChanged();
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _editQty(PosOrderItem item) async {
    final qty = await promptText(context, title: 'Qty baru', initial: item.qty.toString(), isNumber: true);
    if (qty == null || qty.isEmpty) return;
    final q = int.tryParse(qty);
    if (q == null || q < 1) return;
    setState(() => _loading = true);
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      await widget.services.orderService.updateItemQty(
        token: session.accessToken,
        actor: session.username,
        roleName: session.roleName,
        itemId: item.id!,
        newQty: q,
      );
      await _loadItems();
      widget.onChanged();
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<bool> _ensureSensitiveAllowed({required String action, required double amount}) async {
    final thresholdRaw = await _config.getString('cancel_high_threshold', fallback: '500000');
    final threshold = double.tryParse(thresholdRaw) ?? 500000;
    if (amount < threshold) return true;
    final guard = await widget.services.authService.permissionGuard();
    if (guard.canSensitiveAction(action)) return true;
    final pinHash = await _config.getString('manager_pin_hash', fallback: '');
    if (pinHash.isEmpty) {
      if (!mounted) return false;
      showError(context, StateError('PIN override belum diset di Settings'));
      return false;
    }
    if (!mounted) return false;
    final pin = await promptText(context, title: 'Masukkan PIN Override', hint: 'PIN', isNumber: true, obscure: true);
    if (!mounted) return false;
    if (pin == null || pin.isEmpty) return false;
    if (hashPin(pin) != pinHash) {
      showError(context, StateError('PIN salah'));
      return false;
    }
    return true;
  }

  Future<void> _cancelItem(PosOrderItem item) async {
    final allowed = await _ensureSensitiveAllowed(action: 'void_large', amount: item.lineSubtotal);
    if (!allowed) return;
    setState(() => _loading = true);
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      await widget.services.orderService.cancelItem(
        token: session.accessToken,
        actor: session.username,
        roleName: session.roleName,
        itemId: item.id!,
      );
      await _loadItems();
      widget.onChanged();
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _moveTable() async {
    final session = await widget.services.authService.currentSession();
    if (session == null) throw StateError('Belum login');
    if (_currentOrderLocalId == null) return;
    if (!mounted) return;
    final to = await promptText(context, title: 'Pindah meja ke', hint: 'Kode meja');
    if (!mounted) return;
    if (to == null || to.isEmpty) return;
    await widget.services.orderService.moveTable(
      token: session.accessToken,
      actor: session.username,
      roleName: session.roleName,
      orderLocalId: _currentOrderLocalId!,
      toTableCode: to,
    );
    setState(() => _selectedTable = to);
  }

  Future<void> _cancelOrder() async {
    if (_currentOrderLocalId == null) return;
    final session = await widget.services.authService.currentSession();
    if (session == null) throw StateError('Belum login');
    final allowed = await _ensureSensitiveAllowed(action: 'cancel_large', amount: _total);
    if (!allowed) return;
    // ignore: use_build_context_synchronously
    final reason = await promptText(context, title: 'Alasan cancel', hint: 'Mis. customer batal');
    if (!mounted) return;
    if (reason == null || reason.isEmpty) return;
    await widget.services.orderService.cancelOrder(
      token: session.accessToken,
      actor: session.username,
      roleName: session.roleName,
      orderLocalId: _currentOrderLocalId!,
      reason: reason,
    );
    setState(() {
      _currentOrderLocalId = null;
      _items = [];
      _total = 0;
    });
  }

  Future<void> _setOrderNote() async {
    if (_currentOrderLocalId == null) return;
    final note = await promptText(context, title: 'Catatan Order', hint: 'Mis. no sugar');
    if (!mounted) return;
    if (note == null) return;
    final db = await LocalDb.open();
    await db.update(
      'local_orders',
      {'note': note, 'updated_at': DateTime.now().toIso8601String()},
      where: 'local_id = ?',
      whereArgs: [_currentOrderLocalId],
    );
    setState(() => _status = 'Catatan tersimpan');
  }

  Future<void> _loadOpenOrders() async {
    final db = await LocalDb.open();
    final rows = await db.query(
      'local_orders',
      where: "status IN ('new','preparing','ready','served')",
      orderBy: 'created_at DESC',
      limit: 20,
    );
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Hold/Resume Order'),
          content: SizedBox(
            width: 420,
            height: 320,
            child: ListView.builder(
              itemCount: rows.length,
              itemBuilder: (context, idx) {
                final o = rows[idx];
                final id = o['local_id'].toString();
                return ListTile(
                  title: Text('Order $id (${o['status']})'),
                  subtitle: Text('Meja: ${o['table_code'] ?? '-'}'),
                  onTap: () {
                    setState(() => _currentOrderLocalId = id);
                    Navigator.pop(context);
                    _loadItems();
                  },
                );
              },
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final categories = <String>{'All'};
    for (final p in _allProducts) {
      final cat = p['category']?.toString();
      if (cat != null && cat.isNotEmpty) categories.add(cat);
    }
    final width = MediaQuery.of(context).size.width;
    final crossAxis = width > 1200 ? 4 : width > 900 ? 3 : 2;
    final quickAdd = _products.take(8).toList();

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionCard(
                  title: 'Meja & Order',
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_menuStatus.isNotEmpty) ...[
                        Text(_menuStatus, style: const TextStyle(fontSize: 12, color: Colors.green)),
                        const SizedBox(width: 8),
                      ],
                      IconButton(
                        icon: const Icon(Icons.refresh),
                        onPressed: _refreshingMenu ? null : _refreshMaster,
                        tooltip: 'Refresh Menu',
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              decoration: const InputDecoration(labelText: 'Pilih Meja', isDense: true),
                              value: _selectedTable,
                              items: _tables
                                  .map((t) => DropdownMenuItem(
                                        value: t['table_code'].toString(),
                                        child: Text('${t['table_code']} - ${t['table_name']}'),
                                      ))
                                  .toList(),
                              onChanged: (v) => setState(() => _selectedTable = v),
                            ),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton.icon(
                            onPressed: _loading ? null : _loadOpenOrders, 
                            icon: const Icon(Icons.pause),
                            label: const Text('Hold/Resume'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _loading ? null : _moveTable, 
                              icon: const Icon(Icons.compare_arrows),
                              label: const Text('Pindah Meja'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SectionCard(
                  title: 'Keranjang',
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Order: ${_currentOrderLocalId ?? '-'}', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold)),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red),
                        onPressed: _loading || _currentOrderLocalId == null ? null : _cancelOrder,
                        tooltip: 'Cancel Order',
                      ),
                      IconButton(
                        icon: const Icon(Icons.note_add),
                        onPressed: _loading ? null : _setOrderNote,
                        tooltip: 'Catatan Order',
                      ),
                    ],
                  ),
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: [
                      SizedBox(
                        height: 300,
                        child: _items.isEmpty 
                            ? const Center(child: Text('Keranjang Kosong', style: TextStyle(color: Colors.grey)))
                            : ListView.separated(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                itemCount: _items.length,
                                separatorBuilder: (_, __) => const Divider(height: 1),
                                itemBuilder: (context, idx) {
                                  final item = _items[idx];
                                  return ListTile(
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                                    title: Text(item.productName, style: const TextStyle(fontWeight: FontWeight.bold)),
                                    subtitle: Text('Rp ${item.lineSubtotal}'),
                                    leading: CircleAvatar(
                                      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                                      child: Text('${item.qty}'),
                                    ),
                                    trailing: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        IconButton(icon: const Icon(Icons.remove_circle_outline), onPressed: _loading ? null : () => _editQty(item)),
                                        IconButton(icon: const Icon(Icons.delete_outline, color: Colors.redAccent), onPressed: _loading ? null : () => _cancelItem(item)),
                                      ],
                                    ),
                                  );
                                },
                              ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.surface,
                          border: const Border(top: BorderSide(color: Colors.black12)),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Discount', style: TextStyle(fontSize: 16)),
                                SizedBox(
                                  width: 140,
                                  child: TextField(
                                    decoration: const InputDecoration(
                                      prefixText: 'Rp ',
                                      isDense: true,
                                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                    ),
                                    keyboardType: TextInputType.number,
                                    onChanged: (v) => setState(() => _discount = double.tryParse(v) ?? 0),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Total', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                                Text(
                                  'Rp ${(_total - _discount).clamp(0, double.infinity)}',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: Theme.of(context).colorScheme.primary),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const VerticalDivider(),
          Expanded(
            flex: 4,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionCard(
                  title: 'Produk',
                  trailing: ElevatedButton(
                    onPressed: _loading
                        ? null
                        : () {
                            setState(() {
                              _currentOrderLocalId = null;
                              _items = [];
                              _total = 0;
                              _discount = 0;
                            });
                          },
                    child: const Text('+ New Order'),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              decoration: const InputDecoration(
                                labelText: 'Cari produk',
                                prefixIcon: Icon(Icons.search),
                              ),
                              onChanged: (v) {
                                _search = v;
                                _applyFilters();
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Wrap(
                          spacing: 8,
                          children: categories
                              .map((c) => ChoiceChip(
                                    label: Text(c, style: TextStyle(fontWeight: (_selectedCategory == c || (_selectedCategory == null && c == 'All')) ? FontWeight.bold : FontWeight.normal)),
                                    selected: _selectedCategory == c || (_selectedCategory == null && c == 'All'),
                                    onSelected: (_) {
                                      setState(() => _selectedCategory = c);
                                      _applyFilters();
                                    },
                                    selectedColor: Theme.of(context).colorScheme.primaryContainer,
                                    labelStyle: TextStyle(color: (_selectedCategory == c || (_selectedCategory == null && c == 'All')) ? Theme.of(context).colorScheme.primary : Colors.black87),
                                  ))
                              .toList(),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: GridView.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: crossAxis,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.2,
                    ),
                    itemCount: _products.length,
                    itemBuilder: (context, idx) {
                      final p = _products[idx];
                      return Card(
                        clipBehavior: Clip.antiAlias,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 1,
                        child: InkWell(
                          onTap: _loading ? null : () => _addItem(p),
                          child: Stack(
                            children: [
                              Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(Icons.fastfood_outlined, color: Colors.grey, size: 28),
                                    const Spacer(),
                                    Text(
                                      p['name'].toString(), 
                                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Rp ${p['price']}', 
                                      style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.w600, fontSize: 16),
                                    ),
                                  ],
                                ),
                              ),
                              Positioned(
                                top: 12,
                                right: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: (p['stock'] as num).toInt() < 5 ? Colors.redAccent.withOpacity(0.1) : Colors.green.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'Sisa ${p['stock']}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: (p['stock'] as num).toInt() < 5 ? Colors.redAccent : Colors.green,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                if (_status.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_status)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}