import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/core/idempotency.dart';
import 'package:pos_flutter/features/errors/error_mapper.dart';

void main() {
  test('idempotency key should be unique enough per call', () {
    final a = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/pay',
      actor: 'kasir1',
    );
    final b = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/pay',
      actor: 'kasir1',
    );
    expect(a == b, isFalse);
  });

  test('error mapper should return cashier-friendly message', () {
    final msg = toCashierMessage('SocketException timeout');
    expect(msg.toLowerCase().contains('koneksi'), isTrue);
  });
}
