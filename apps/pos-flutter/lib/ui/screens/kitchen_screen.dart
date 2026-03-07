import 'package:flutter/material.dart';

import '../../core/constants.dart';
import '../../core/local_db.dart';
import '../../pos_app_service.dart';
import '../ui_utils.dart';
import '../widgets/section_card.dart';

class KitchenScreen extends StatefulWidget {
  const KitchenScreen({super.key, required this.services});

  final PosAppService services;

  @override
  State<KitchenScreen> createState() => _KitchenScreenState();
}

class _KitchenScreenState extends State<KitchenScreen> {
  List<Map<String, Object?>> _orders = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final db = await LocalDb.open();
    final rows = await db.query(
      'local_orders',
      where: "status IN ('new','preparing','ready','served')",
      orderBy: 'created_at ASC',
      limit: 50,
    );
    if (!mounted) return;
    setState(() => _orders = rows);
  }

  Future<void> _setStatus(String localId, OrderStatus next) async {
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      await widget.services.orderService.updateStatus(
        token: session.accessToken,
        actor: session.username,
        roleName: session.roleName,
        orderLocalId: localId,
        nextStatus: next,
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    }
  }

  @override
  Widget build(BuildContext context) {
    final newOrders = _orders.where((o) => o['status'] == 'new').toList();
    final preparingOrders = _orders.where((o) => o['status'] == 'preparing').toList();
    final readyOrders = _orders.where((o) => o['status'] == 'ready').toList();

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SectionCard(
            title: 'Kitchen Board',
            child: Text('Update status order dari sini'),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(child: _kanbanColumn('New', newOrders, OrderStatus.preparing)),
                const SizedBox(width: 8),
                Expanded(child: _kanbanColumn('Preparing', preparingOrders, OrderStatus.ready)),
                const SizedBox(width: 8),
                Expanded(child: _kanbanColumn('Ready', readyOrders, OrderStatus.served)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _kanbanColumn(String title, List<Map<String, Object?>> orders, OrderStatus nextStatus) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const Divider(),
            Expanded(
              child: ListView.builder(
                itemCount: orders.length,
                itemBuilder: (context, idx) {
                  final o = orders[idx];
                  final localId = o['local_id'].toString();
                  return Card(
                    child: ListTile(
                      title: Text('Order $localId'),
                      subtitle: Text('Meja: ${o['table_code'] ?? '-'}'),
                      trailing: TextButton(
                        onPressed: () => _setStatus(localId, nextStatus),
                        child: Text('-> ${nextStatus.value}'),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
