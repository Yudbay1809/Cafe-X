class DeviceSession {
  DeviceSession({
    required this.username,
    required this.roleName,
    required this.permissions,
    required this.tenantId,
    required this.outletId,
    required this.accessToken,
    required this.expiresAt,
    this.pinHash,
  });

  final String username;
  final String roleName;
  final List<String> permissions;
  final int tenantId;
  final int outletId;
  final String accessToken;
  final String expiresAt;
  final String? pinHash;

  Map<String, dynamic> toMap() {
    return {
      'username': username,
      'role_name': roleName,
      'permissions_json': permissions,
      'tenant_id': tenantId,
      'outlet_id': outletId,
      'access_token': accessToken,
      'expires_at': expiresAt,
      'pin_hash': pinHash,
    };
  }
}
