import '../../core/constants.dart';

class OrderStateMachine {
  static final Map<OrderStatus, Set<OrderStatus>> _allowed = {
    OrderStatus.newer: {OrderStatus.preparing, OrderStatus.canceled},
    OrderStatus.preparing: {OrderStatus.ready, OrderStatus.canceled},
    OrderStatus.ready: {OrderStatus.served, OrderStatus.canceled},
    OrderStatus.served: {OrderStatus.paid, OrderStatus.canceled},
    OrderStatus.paid: {},
    OrderStatus.canceled: {},
  };

  bool canTransition(OrderStatus from, OrderStatus to) {
    if (from == to) return true;
    return _allowed[from]?.contains(to) == true;
  }

  void assertTransition(OrderStatus from, OrderStatus to) {
    if (!canTransition(from, to)) {
      throw StateError(
        'Invalid order status transition: ${from.value} -> ${to.value}',
      );
    }
  }
}
