import 'package:flutter_test/flutter_test.dart';
import 'package:pos_flutter/features/permission/permission_guard.dart';

void main() {
  test('permission map should work', () {
    final guard = PermissionGuard(
      roleName: 'kasir',
      permissions: {'order.create', 'order.pay'},
    );
    expect(guard.canCreateOrder(), isTrue);
    expect(guard.canPayOrder(), isTrue);
    expect(guard.canCancelOrder(), isFalse);
  });

  test('sensitive action must require admin or owner when no pin override', () {
    final guardKasir = PermissionGuard(
      roleName: 'kasir',
      permissions: {'order.cancel'},
    );
    final guardAdmin = PermissionGuard(roleName: 'admin', permissions: {'*'});
    expect(guardKasir.canSensitiveAction('refund'), isFalse);
    expect(guardAdmin.canSensitiveAction('refund'), isTrue);
    expect(guardKasir.canSensitiveAction('refund', pinOverride: true), isTrue);
  });
}
