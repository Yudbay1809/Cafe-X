import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/core/constants.dart';
import 'package:pos_flutter/features/order/order_state_machine.dart';

void main() {
  test('valid transition path should pass', () {
    final sm = OrderStateMachine();
    expect(sm.canTransition(OrderStatus.newer, OrderStatus.preparing), isTrue);
    expect(sm.canTransition(OrderStatus.preparing, OrderStatus.ready), isTrue);
    expect(sm.canTransition(OrderStatus.ready, OrderStatus.served), isTrue);
    expect(sm.canTransition(OrderStatus.served, OrderStatus.paid), isTrue);
  });

  test('invalid transition paid to canceled should fail', () {
    final sm = OrderStateMachine();
    expect(sm.canTransition(OrderStatus.paid, OrderStatus.canceled), isFalse);
  });
}
