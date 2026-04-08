import 'dart:convert';

import 'package:flutter/material.dart';

import '../../core/local_db.dart';
import '../widgets/section_card.dart';

class SyncConflictsScreen extends StatefulWidget {
  const SyncConflictsScreen({super.key, required this.onChanged});

  final VoidCallback onChanged;

  @override
  State<SyncConflictsScreen> createState() => _SyncConflictsScreenState();
}

class _SyncConflictsScreenState extends State<SyncConflictsScreen> {
  bool _loading = false;
  String _status = '';
  List<Map<String, Object?>> _rows = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _status = '';
    });
    final db = await LocalDb.open();
    final rows = await db.query(
      'pending_events',
      where:
          "last_error IS NOT NULL AND (last_error LIKE ? OR last_error LIKE ?)",
      whereArgs: ['%conflict%', '%invalid%'],
      orderBy: 'updated_at DESC',
      limit: 200,
    );
    if (!mounted) return;
    setState(() {
      _rows = rows;
      _loading = false;
    });
    widget.onChanged();
  }

  String _suggestion(Map<String, Object?> row) {
    final eventType = row['event_type']?.toString() ?? '-';
    if (eventType.contains('pay')) {
      return 'Cek status order, pastikan belum paid ganda.';
    }
    if (eventType.contains('add_item')) {
      return 'Cek stok atau status order sebelum retry.';
    }
    if (eventType.contains('status')) {
      return 'Cek urutan status order (new->preparing->ready->served->paid).';
    }
    return 'Periksa payload, lalu retry atau discard jika event sudah tidak relevan.';
  }

  String _payloadSummary(Map<String, Object?> row) {
    try {
      final payloadRaw = row['payload_json']?.toString() ?? '{}';
      final payload = jsonDecode(payloadRaw) as Map<String, dynamic>;
      final orderId = payload['order_id']?.toString() ??
          payload['local_order_id']?.toString() ??
          '-';
      final productId = payload['product_id']?.toString();
      if (productId != null) return 'order: $orderId, product: $productId';
      return 'order: $orderId';
    } catch (_) {
      return '-';
    }
  }

  Future<void> _retryOne(int id) async {
    final db = await LocalDb.open();
    await db.update(
      'pending_events',
      {
        'retries': 0,
        'next_retry_at': null,
        'last_error': null,
        'updated_at': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [id],
    );
    if (!mounted) return;
    setState(() => _status = 'Event #$id dijadwalkan retry.');
    await _load();
  }

  Future<void> _discardOne(int id) async {
    final db = await LocalDb.open();
    await db.delete('pending_events', where: 'id = ?', whereArgs: [id]);
    if (!mounted) return;
    setState(() => _status = 'Event #$id dibuang dari queue.');
    await _load();
  }

  Future<void> _retryAll() async {
    final db = await LocalDb.open();
    await db.update(
      'pending_events',
      {
        'retries': 0,
        'next_retry_at': null,
        'last_error': null,
        'updated_at': DateTime.now().toIso8601String(),
      },
      where:
          "last_error IS NOT NULL AND (last_error LIKE ? OR last_error LIKE ?)",
      whereArgs: ['%conflict%', '%invalid%'],
    );
    if (!mounted) return;
    setState(() => _status = 'Semua conflict dijadwalkan retry.');
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionCard(
            title: 'Sync Conflict Resolution',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                    'Konflik sync butuh keputusan kasir/admin. Gunakan saran di bawah sebelum retry.'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ElevatedButton(
                        onPressed: _loading ? null : _load,
                        child: const Text('Refresh')),
                    OutlinedButton(
                        onPressed: _loading || _rows.isEmpty ? null : _retryAll,
                        child: const Text('Retry Semua')),
                  ],
                ),
                if (_status.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(_status),
                ],
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _rows.isEmpty
                    ? const SectionCard(
                        title: 'Tidak ada conflict',
                        child: Text('Queue sync bersih.'))
                    : ListView.separated(
                        itemCount: _rows.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, index) {
                          final row = _rows[index];
                          final id = (row['id'] as num?)?.toInt() ?? 0;
                          final eventType =
                              row['event_type']?.toString() ?? '-';
                          final endpoint = row['endpoint']?.toString() ?? '-';
                          final retries = row['retries']?.toString() ?? '0';
                          final error = row['last_error']?.toString() ?? '-';
                          return SectionCard(
                            title: 'Event #$id - $eventType',
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Endpoint: $endpoint'),
                                Text('Retry count: $retries'),
                                Text('Payload: ${_payloadSummary(row)}'),
                                const SizedBox(height: 6),
                                Text('Error: $error',
                                    style: const TextStyle(
                                        color: Color(0xFFB91C1C))),
                                const SizedBox(height: 6),
                                Text('Saran: ${_suggestion(row)}',
                                    style: const TextStyle(
                                        color: Color(0xFF0F766E))),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 8,
                                  children: [
                                    ElevatedButton(
                                        onPressed: () => _retryOne(id),
                                        child: const Text('Retry')),
                                    OutlinedButton(
                                        onPressed: () => _discardOne(id),
                                        child: const Text('Discard')),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
