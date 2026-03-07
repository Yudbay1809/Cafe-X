import 'package:flutter/material.dart';
import 'dart:async';

import '../../core/constants.dart';
import '../../features/payment/payment_service.dart';
import '../../pos_app_service.dart';
import '../ui_utils.dart';
import '../widgets/section_card.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key, required this.services, required this.onChanged});

  final PosAppService services;
  final VoidCallback onChanged;

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final _orderId = TextEditingController();
  final List<_PayRow> _rows = [const _PayRow(method: PaymentMethod.cash, amount: '0')];
  bool _loading = false;
  String _status = '';
  StreamSubscription<String>? _shortcutSub;

  @override
  void initState() {
    super.initState();
    _shortcutSub = widget.services.shortcutBus.stream.listen((action) {
      if (action == 'quick_pay_cash') {
        _quickPay(PaymentMethod.cash);
      } else if (action == 'quick_pay_qris') {
        _quickPay(PaymentMethod.qris);
      }
    });
  }

  @override
  void dispose() {
    _shortcutSub?.cancel();
    super.dispose();
  }

  Future<void> _pay() async {
    setState(() {
      _loading = true;
      _status = '';
    });
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      final orderLocalId = _orderId.text.trim();
      if (orderLocalId.isEmpty) throw StateError('Order ID kosong');
      final payments = _rows.map((r) {
        final amount = double.tryParse(r.amount) ?? 0;
        return PaymentPart(method: r.method, amount: amount);
      }).toList();
      final result = await widget.services.paymentService.payOrder(
        token: session.accessToken,
        actor: session.username,
        roleName: session.roleName,
        orderLocalId: orderLocalId,
        payments: payments,
      );
      setState(() => _status = 'Paid. Change: ${result['change_amount']}');
      widget.onChanged();
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<double> _getTotal(String orderLocalId) async {
    final detail = await widget.services.orderService.detail(orderLocalId);
    if (detail == null) {
      throw StateError('Order tidak ditemukan');
    }
    return detail.totalAmount;
  }

  Future<void> _quickPay(PaymentMethod method) async {
    setState(() {
      _loading = true;
      _status = '';
    });
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      final orderLocalId = _orderId.text.trim();
      if (orderLocalId.isEmpty) throw StateError('Order ID kosong');
      final total = await _getTotal(orderLocalId);
      final result = await widget.services.paymentService.payOrder(
        token: session.accessToken,
        actor: session.username,
        roleName: session.roleName,
        orderLocalId: orderLocalId,
        payments: [PaymentPart(method: method, amount: total)],
      );
      setState(() => _status = 'Quick pay OK. Change: ${result['change_amount']}');
      widget.onChanged();
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: SectionCard(
        title: 'Payment',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(controller: _orderId, decoration: const InputDecoration(labelText: 'Order Local ID (L...)')),
            const SizedBox(height: 12),
            const Text('Metode Pembayaran'),
            ..._rows.asMap().entries.map((entry) {
              final idx = entry.key;
              final row = entry.value;
              return Row(
                children: [
                  DropdownButton<PaymentMethod>(
                    value: row.method,
                    items: PaymentMethod.values
                        .map((m) => DropdownMenuItem(value: m, child: Text(m.value)))
                        .toList(),
                    onChanged: (v) {
                      setState(() => _rows[idx] = row.copyWith(method: v ?? row.method));
                    },
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(labelText: 'Amount'),
                      keyboardType: TextInputType.number,
                      onChanged: (v) => _rows[idx] = row.copyWith(amount: v),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete),
                    onPressed: _rows.length > 1 ? () => setState(() => _rows.removeAt(idx)) : null,
                  ),
                ],
              );
            }),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: () => setState(() => _rows.add(const _PayRow(method: PaymentMethod.cash, amount: '0'))),
                child: const Text('Tambah Split Payment'),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton(
                  onPressed: _loading ? null : () => _quickPay(PaymentMethod.cash),
                  child: const Text('Quick Pay: Cash Exact'),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: _loading ? null : () => _quickPay(PaymentMethod.qris),
                  child: const Text('Quick Pay: QRIS'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: _loading ? null : _pay, child: const Text('Pay')),
            if (_status.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_status)),
          ],
        ),
      ),
    );
  }
}

class _PayRow {
  const _PayRow({required this.method, required this.amount});

  final PaymentMethod method;
  final String amount;

  _PayRow copyWith({PaymentMethod? method, String? amount}) {
    return _PayRow(method: method ?? this.method, amount: amount ?? this.amount);
  }
}
