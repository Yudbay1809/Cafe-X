import 'dart:convert';

import 'package:dio/dio.dart';
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
    try {
      final res = await _apiClient.post(
        '/api/v1/auth/login',
        token: '',
        data: {
          'username': username,
          'password': password,
          'device_name': deviceName,
        },
        responseType: ResponseType.plain,
        allowAnyStatus: true,
      );

      final body = _normalizeBody(res.data);
      final status = res.statusCode ?? 0;
      if (status >= 400) {
        final msg =
            (body['message'] ?? 'Login gagal (HTTP $status)').toString();
        throw StateError(msg);
      }

      Map<String, dynamic> data =
          (body['data'] as Map<String, dynamic>? ?? <String, dynamic>{});

      if (data['ok'] is bool && data['data'] is Map<String, dynamic>) {
        data = data['data'] as Map<String, dynamic>;
      }

      final user =
          (data['user'] as Map<String, dynamic>? ?? <String, dynamic>{});
      final permissions = ((data['permissions'] as List?) ?? const [])
          .map((e) => e.toString())
          .toList();
      final token = (data['token'] ?? data['access_token'] ?? '').toString();

      if (token.isEmpty) {
        throw StateError('Token login tidak ditemukan dari server');
      }

      final session = DeviceSession(
        username: user['username']?.toString() ?? username,
        roleName: user['role']?.toString() ?? 'kasir',
        permissions: permissions,
        tenantId: (user['tenant_id'] as num?)?.toInt() ?? 1,
        outletId: (user['outlet_id'] as num?)?.toInt() ?? 1,
        accessToken: token,
        expiresAt: data['expires_at']?.toString() ??
            DateTime.now()
                .add(const Duration(days: 30))
                .toUtc()
                .toIso8601String(),
        pinHash: pinHash,
      );

      await _saveSession(session);
      return session;
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      final body = e.response?.data;

      String? backendMessage;
      if (body is Map<String, dynamic>) {
        final msg = (body['message'] ?? '').toString().trim();
        if (msg.isNotEmpty) {
          backendMessage = msg;
        }
      } else if (body is String) {
        try {
          final normalized = _normalizeBody(body);
          final msg = (normalized['message'] ?? '').toString().trim();
          if (msg.isNotEmpty) {
            backendMessage = msg;
          }
        } catch (_) {
          // ignore parse error, use raw fallback
        }
      }

      final raw = _truncate((body ?? '').toString());
      final dioMsg = (e.message ?? '').trim();
      final dioError = _truncate((e.error ?? '').toString());
      final type = _dioType(e);
      final method = e.requestOptions.method;
      final uri = e.requestOptions.uri.toString();

      final parts = <String>[
        'Login gagal',
        'type=$type',
        'method=$method',
        'uri=$uri',
        if (status != null) 'status=$status',
        if (backendMessage != null && backendMessage.isNotEmpty)
          'message=$backendMessage',
        if (dioMsg.isNotEmpty) 'dio=$dioMsg',
        if (dioError.isNotEmpty && dioError != 'null') 'error=$dioError',
        if (raw.isNotEmpty) 'raw=$raw',
      ];

      throw StateError(parts.join(' | '));
    } on Object catch (e) {
      throw StateError(
        'Login gagal internal | type=${e.runtimeType} | err=${_truncate(e.toString())}',
      );
    }
  }

  Map<String, dynamic> _normalizeBody(dynamic raw) {
    dynamic current = raw;

    for (var i = 0; i < 4; i++) {
      if (current is Map<String, dynamic>) {
        return current;
      }

      if (current is String) {
        final cleaned = _sanitizeJsonString(current);
        try {
          current = jsonDecode(cleaned);
          continue;
        } catch (_) {
          final unescaped = cleaned
              .replaceAll('\\"', '"')
              .replaceAll('\\n', '')
              .replaceAll('\\r', '')
              .trim();
          current = jsonDecode(unescaped);
          continue;
        }
      }

      if (current is List<int>) {
        current = utf8.decode(current);
        continue;
      }

      break;
    }

    throw StateError(
      'Format respons login tidak valid. Type=${raw.runtimeType}, Raw=${_truncate(raw.toString())}',
    );
  }

  String _sanitizeJsonString(String value) {
    var cleaned = value.replaceAll('\ufeff', '').replaceAll('﻿', '').trim();

    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }

    final firstBrace = cleaned.indexOf('{');
    final firstBracket = cleaned.indexOf('[');
    var first = -1;
    if (firstBrace >= 0 && firstBracket >= 0) {
      first = firstBrace < firstBracket ? firstBrace : firstBracket;
    } else if (firstBrace >= 0) {
      first = firstBrace;
    } else if (firstBracket >= 0) {
      first = firstBracket;
    }
    if (first > 0) {
      cleaned = cleaned.substring(first);
    }

    return cleaned;
  }

  String _dioType(DioException e) {
    final dynamic t = e.type;
    if (t == null) return 'unknown';
    final asString = t.toString();
    if (asString.contains('.')) {
      return asString.split('.').last;
    }
    return asString;
  }

  String _truncate(String input) {
    if (input.length <= 200) return input;
    return '${input.substring(0, 200)}...';
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

    final tableInfo = await db.rawQuery('PRAGMA table_info(device_sessions)');
    final availableColumns = tableInfo
        .map((row) => row['name']?.toString() ?? '')
        .where((name) => name.isNotEmpty)
        .toSet();

    final payload = <String, Object?>{
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
    };

    payload.removeWhere((key, _) => !availableColumns.contains(key));

    await db.insert(
      'device_sessions',
      payload,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }
}
