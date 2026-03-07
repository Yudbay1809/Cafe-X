import '../auth/auth_service.dart';
import '../order/order_service.dart';
import '../payment/payment_service.dart';
import '../../core/constants.dart';

class SmokeTestService {
  SmokeTestService({
    required AuthService authService,
    required OrderService orderService,
    required PaymentService paymentService,
  }) : _authService = authService,
       _orderService = orderService,
       _paymentService = paymentService;

  final AuthService _authService;
  final OrderService _orderService;
  final PaymentService _paymentService;

  Future<Map<String, dynamic>> run({
    required int productId,
    required String tableCode,
  }) async {
    final session = await _authService.currentSession();
    if (session == null) {
      throw StateError('Belum login kasir');
    }

    final orderLocalId = await _orderService.createOrder(
      token: session.accessToken,
      actor: session.username,
      roleName: session.roleName,
      source: 'POS',
      tableCode: tableCode,
      note: 'smoke test',
    );
    await _orderService.addItem(
      token: session.accessToken,
      actor: session.username,
      roleName: session.roleName,
      orderLocalId: orderLocalId,
      productId: productId,
      qty: 1,
    );
    await _orderService.updateStatus(
      token: session.accessToken,
      actor: session.username,
      roleName: session.roleName,
      orderLocalId: orderLocalId,
      nextStatus: OrderStatus.preparing,
    );
    await _orderService.updateStatus(
      token: session.accessToken,
      actor: session.username,
      roleName: session.roleName,
      orderLocalId: orderLocalId,
      nextStatus: OrderStatus.ready,
    );
    await _orderService.updateStatus(
      token: session.accessToken,
      actor: session.username,
      roleName: session.roleName,
      orderLocalId: orderLocalId,
      nextStatus: OrderStatus.served,
    );
    final order = await _orderService.detail(orderLocalId);
    await _paymentService.payOrder(
      token: session.accessToken,
      actor: session.username,
      roleName: session.roleName,
      orderLocalId: orderLocalId,
      payments: [
        PaymentPart(
          method: PaymentMethod.cash,
          amount: order?.totalAmount ?? 0,
        ),
      ],
    );
    final finalOrder = await _orderService.detail(orderLocalId);
    return {
      'order_local_id': orderLocalId,
      'status': finalOrder?.status.value,
      'total_amount': finalOrder?.totalAmount,
    };
  }
}
