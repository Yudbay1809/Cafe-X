class PermissionGuard {
  PermissionGuard({required this.roleName, required this.permissions});

  final String roleName;
  final Set<String> permissions;

  bool can(String permission) {
    return permissions.contains('*') || permissions.contains(permission);
  }

  bool canCloseShift() => can('shift.close');
  bool canManageTables() => can('table.manage');
  bool canCreateOrder() => can('order.create');
  bool canPayOrder() => can('order.pay');
  bool canCancelOrder() => can('order.cancel');
  bool canViewReport() => can('report.view');

  bool canSensitiveAction(String action, {bool pinOverride = false}) {
    if (pinOverride) {
      return true;
    }
    switch (action) {
      case 'refund':
      case 'cancel_large':
      case 'void_large':
        return roleName == 'owner' || roleName == 'admin';
      default:
        return true;
    }
  }
}
