import 'dart:convert';

import '../../core/local_db.dart';
import '../../core/time_utils.dart';

class AuditService {
  Future<void> log({
    required String action,
    required String actor,
    required String roleName,
    required Map<String, dynamic> payload,
  }) async {
    final db = await LocalDb.open();
    await db.insert('audit_logs', {
      'action': action,
      'actor': actor,
      'role_name': roleName,
      'payload_json': jsonEncode(payload),
      'created_at': nowIso(),
    });
  }
}
