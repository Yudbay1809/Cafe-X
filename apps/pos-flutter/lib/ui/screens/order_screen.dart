import 'package:flutter/material.dart';
import 'dart:async';

import '../../core/local_db.dart';
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
  StreamSubscription<String>? _shortcutSub;

  @override
  void initState() {
    super.initState();
    _loadTables();
    _loadProducts();
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
      // ignore: use_build_context_synchronously
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

  Future<void> _cancelItem(PosOrderItem item) async {
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
    // ignore: use_build_context_synchronously
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      DropdownButton<String>(
                        value: _selectedTable,
                        hint: const Text('Pilih meja'),
                        items: _tables
                            .map((t) => DropdownMenuItem(
                                  value: t['table_code'].toString(),
                                  child: Text('${t['table_code']} - ${t['table_name']}'),
                                ))
                            .toList(),
                        onChanged: (v) => setState(() => _selectedTable = v),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          ElevatedButton(onPressed: _loading ? null : _loadOpenOrders, child: const Text('Hold/Resume')),
                          const SizedBox(width: 8),
                          OutlinedButton(onPressed: _loading ? null : _moveTable, child: const Text('Pindah Meja')),
                          const SizedBox(width: 8),
                          OutlinedButton(onPressed: _loading ? null : _setOrderNote, child: const Text('Catatan')),
                        ],
                      ),
                    ],
                  ),
                ),
                SectionCard(
                  title: 'Quick Actions',
                  child: Row(
                    children: [
                      ElevatedButton(
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
                        child: const Text('New Order'),
                      ),
                      const SizedBox(width: 8),
                      OutlinedButton(onPressed: _loading ? null : _cancelOrder, child: const Text('Cancel Order')),
                      const SizedBox(width: 8),
                      OutlinedButton(onPressed: _loading ? null : _setOrderNote, child: const Text('Note')),
                    ],
                  ),
                ),
                SectionCard(
                  title: 'Keranjang',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Order: ${_currentOrderLocalId ?? '-'}'),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 260,
                        child: ListView.builder(
                          itemCount: _items.length,
                          itemBuilder: (context, idx) {
                            final item = _items[idx];
                            return ListTile(
                              title: Text('${item.productName} x${item.qty}'),
                              subtitle: Text('Rp ${item.lineSubtotal}'),
                              trailing: Wrap(
                                spacing: 8,
                                children: [
                                  IconButton(icon: const Icon(Icons.edit), onPressed: _loading ? null : () => _editQty(item)),
                                  IconButton(icon: const Icon(Icons.delete), onPressed: _loading ? null : () => _cancelItem(item)),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const Divider(),
                      Row(
                        children: [
                          const Text('Discount'),
                          const SizedBox(width: 8),
                          SizedBox(
                            width: 120,
                            child: TextField(
                              decoration: const InputDecoration(hintText: '0'),
                              keyboardType: TextInputType.number,
                              onChanged: (v) => setState(() => _discount = double.tryParse(v) ?? 0),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Total: Rp ${(_total - _discount).clamp(0, double.infinity)}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        decoration: const InputDecoration(labelText: 'Cari produk'),
                        onChanged: (v) {
                          _search = v;
                          _applyFilters();
                        },
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: categories
                            .map((c) => ChoiceChip(
                                  label: Text(c),
                                  selected: _selectedCategory == c || (_selectedCategory == null && c == 'All'),
                                  onSelected: (_) {
                                    setState(() => _selectedCategory = c);
                                    _applyFilters();
                                  },
                                ))
                            .toList(),
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
                        child: InkWell(
                          onTap: _loading ? null : () => _addItem(p),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(p['name'].toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                                const Spacer(),
                                Text('Rp ${p['price']}'),
                                Text('Stok: ${p['stock']}'),
                              ],
                            ),
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
