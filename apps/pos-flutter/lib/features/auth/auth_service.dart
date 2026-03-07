import 'dart:convert';

import 'package:sqflite/sqflite.dart';

import '../../core/api_client.dart';
import '../../core/local_db.dart';
import '../../core/time_utils.dart';
import '../permission/permission_guard.dart';
import 'auth_models.dart';

class AuthService {
  AuthService(this._apiClient);

  final ApiClient _apiClient;

  Future<DeviceSession> login({
    required String username,
    required String password,
    required String deviceName,
    String? pinHash,
  }) async {
    final res = await _apiClient.post(
      '/api/v1/auth/login',
      token: '',
      data: {
        'username': username,
        'password': password,
        'device_name': deviceName,
      },
    );
    final data =
        (res.data['data'] as Map<String, dynamic>? ?? <String, dynamic>{});
    final user = (data['user'] as Map<String, dynamic>? ?? <String, dynamic>{});
    final permissions = ((data['permissions'] as List?) ?? const [])
        .map((e) => e.toString())
        .toList();
    final token = (data['token'] ?? data['access_token'] ?? '').toString();
    final session = DeviceSession(
      username: user['username']?.toString() ?? username,
      roleName: user['role']?.toString() ?? 'kasir',
      permissions: permissions,
      tenantId: (user['tenant_id'] as num?)?.toInt() ?? 1,
      outletId: (user['outlet_id'] as num?)?.toInt() ?? 1,
      accessToken: token,
      expiresAt:
          data['expires_at']?.toString() ??
          DateTime.now()
              .add(const Duration(days: 30))
              .toUtc()
              .toIso8601String(),
      pinHash: pinHash,
    );

    await _saveSession(session);
    return session;
  }

  Future<void> logout() async {
    final session = await currentSession();
    if (session != null) {
      try {
        await _apiClient.post(
          '/api/v1/auth/logout',
          token: session.accessToken,
          data: {},
        );
      } catch (_) {
        // Keep local cleanup deterministic even if network is down.
      }
    }

    final db = await LocalDb.open();
    await db.delete('device_sessions', where: 'id = 1');
  }

  Future<DeviceSession?> currentSession() async {
    final db = await LocalDb.open();
    final rows = await db.query('device_sessions', where: 'id = 1', limit: 1);
    if (rows.isEmpty) return null;
    final row = rows.first;
    final permissionsRaw = row['permissions_json']?.toString() ?? '[]';
    final permissionsDynamic = jsonDecode(permissionsRaw) as List<dynamic>;
    return DeviceSession(
      username: row['username'].toString(),
      roleName: row['role_name'].toString(),
      permissions: permissionsDynamic.map((e) => e.toString()).toList(),
      tenantId: (row['tenant_id'] as num).toInt(),
      outletId: (row['outlet_id'] as num).toInt(),
      accessToken: row['access_token'].toString(),
      expiresAt: row['expires_at'].toString(),
      pinHash: row['pin_hash']?.toString(),
    );
  }

  Future<PermissionGuard> permissionGuard() async {
    final session = await currentSession();
    if (session == null) {
      return PermissionGuard(roleName: 'guest', permissions: const {});
    }
    return PermissionGuard(
      roleName: session.roleName,
      permissions: session.permissions.toSet(),
    );
  }

  Future<bool> isSessionValid() async {
    final session = await currentSession();
    if (session == null || session.accessToken.isEmpty) return false;
    final expiry = DateTime.tryParse(session.expiresAt);
    if (expiry == null) return false;
    return expiry.isAfter(DateTime.now().toUtc());
  }

  Future<void> _saveSession(DeviceSession session) async {
    final db = await LocalDb.open();
    await db.insert('device_sessions', {
      'id': 1,
      'username': session.username,
      'role_name': session.roleName,
      'permissions_json': jsonEncode(session.permissions),
      'tenant_id': session.tenantId,
      'outlet_id': session.outletId,
      'access_token': session.accessToken,
      'expires_at': session.expiresAt,
      'pin_hash': session.pinHash,
      'created_at': nowIso(),
      'updated_at': nowIso(),
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }
}
