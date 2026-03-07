import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../core/idempotency.dart';
import '../../core/local_db.dart';
import '../../core/time_utils.dart';
import '../audit/audit_service.dart';
import '../order/order_state_machine.dart';
import '../sync/event_queue.dart';

class PaymentPart {
  PaymentPart({required this.method, required this.amount, this.referenceNo});

  final PaymentMethod method;
  final double amount;
  final String? referenceNo;
}

class PaymentService {
  PaymentService({
    required ApiClient apiClient,
    required EventQueue eventQueue,
    required AuditService auditService,
    OrderStateMachine? stateMachine,
  }) : _apiClient = apiClient,
       _eventQueue = eventQueue,
       _auditService = auditService,
       _stateMachine = stateMachine ?? OrderStateMachine();

  final ApiClient _apiClient;
  final EventQueue _eventQueue;
  final AuditService _auditService;
  final OrderStateMachine _stateMachine;

  Future<Map<String, dynamic>> payOrder({
    required String token,
    required String actor,
    required String roleName,
    required String orderLocalId,
    required List<PaymentPart> payments,
    bool offlineAllowed = true,
  }) async {
    if (payments.isEmpty) {
      throw ArgumentError('Pembayaran minimal 1 metode');
    }
    final db = await LocalDb.open();
    final orderRows = await db.query(
      'local_orders',
      where: 'local_id = ?',
      whereArgs: [orderLocalId],
      limit: 1,
    );
    if (orderRows.isEmpty) throw StateError('Order tidak ditemukan');
    final order = orderRows.first;
    final currentStatus = OrderStatus.fromValue(order['status'].toString());
    _stateMachine.assertTransition(currentStatus, OrderStatus.paid);

    final paidRows = await db.rawQuery(
      "SELECT COUNT(*) AS total FROM local_payments WHERE order_local_id = ? AND status = 'success'",
      [orderLocalId],
    );
    if (((paidRows.first['total'] as int?) ?? 0) > 0) {
      throw StateError('Double payment terdeteksi');
    }

    final total = (order['total_amount'] as num).toDouble();
    final paid = payments.fold<double>(0, (sum, p) => sum + p.amount);
    if (paid < total) {
      throw StateError('Nominal pembayaran kurang');
    }

    for (final p in payments) {
      final idem = IdempotencyKeyFactory.create(
        endpoint: '/api/v1/orders/pay',
        actor: actor,
        hint: '$orderLocalId:${p.method.value}:${p.amount}',
      );
      await db.insert('local_payments', {
        'order_local_id': orderLocalId,
        'method': p.method.value,
        'amount': p.amount,
        'status': 'success',
        'idempotency_key': idem,
        'reference_no': p.referenceNo,
        'created_at': nowIso(),
      });

      final payload = {
        'order_id': order['server_order_id'],
        'method': p.method.value,
        'amount': p.amount,
        'reference_no': p.referenceNo,
      };
      try {
        await _apiClient.post(
          '/api/v1/orders/pay',
          token: token,
          idempotencyKey: idem,
          data: payload,
        );
      } catch (_) {
        if (!offlineAllowed) rethrow;
        await _eventQueue.enqueue(
          eventType: 'pay_order',
          endpoint: '/api/v1/orders/pay',
          actor: actor,
          idempotencyKey: idem,
          payload: payload,
        );
      }
    }

    await db.update(
      'local_orders',
      {'status': OrderStatus.paid.value, 'updated_at': nowIso()},
      where: 'local_id = ?',
      whereArgs: [orderLocalId],
    );

    await _auditService.log(
      action: 'order.pay',
      actor: actor,
      roleName: roleName,
      payload: {
        'order_local_id': orderLocalId,
        'total_amount': total,
        'paid_amount': paid,
        'change_amount': paid - total,
        'methods': payments.map((e) => e.method.value).toList(),
      },
    );

    return {
      'order_local_id': orderLocalId,
      'total_amount': total,
      'paid_amount': paid,
      'change_amount': paid - total,
    };
  }
}
