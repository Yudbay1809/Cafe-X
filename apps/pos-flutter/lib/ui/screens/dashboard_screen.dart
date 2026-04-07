import 'dart:convert';

import 'package:flutter/material.dart';

import '../../core/observability.dart';
import '../../core/app_config_service.dart';
import '../../core/local_db.dart';
import '../../pos_app_service.dart';
import '../widgets/section_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key, required this.services});

  final PosAppService services;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _obs = DeviceObservability();
  final _config = AppConfigService();
  Map<String, dynamic> _summary = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final report = await widget.services.shiftReportService.currentShiftSummary();
    final obs = await _obs.summary();
    final pending = await _config.getPendingEventCount();
    final syncHealthRaw = await _config.getString('sync_health', fallback: '{}');
    Map<String, dynamic> syncHealth = {};
    try {
      syncHealth = jsonDecode(syncHealthRaw) as Map<String, dynamic>;
    } catch (_) {
      syncHealth = {};
    }
    final db = await LocalDb.open();
    final receiptRows = await db.rawQuery("SELECT COUNT(*) AS total FROM receipt_queue WHERE status = 'pending'");
    final receiptQueue = (receiptRows.first['total'] as int?) ?? 0;
    if (!mounted) return;
    setState(() {
      _summary = {
        'report': report,
        'obs': obs,
        'pending': pending,
        'syncHealth': syncHealth,
        'receiptQueue': receiptQueue,
      };
    });
  }

  @override
  Widget build(BuildContext context) {
    final report = (_summary['report'] as Map<String, dynamic>?) ?? {};
    final obs = (_summary['obs'] as Map<String, dynamic>?) ?? {};
    final pending = (_summary['pending'] as int?) ?? 0;
    final syncHealth = (_summary['syncHealth'] as Map<String, dynamic>?) ?? {};
    final receiptQueue = (_summary['receiptQueue'] as int?) ?? 0;
    final total = report['total_transaksi'] ?? 0;
    final voids = report['total_void'] ?? 0;
    final variance = report['cash_variance'] ?? '-';
    final failedSync = obs['failed_sync_count'] ?? 0;
    final conflict = syncHealth['conflict'] ?? 0;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _kpi('Transaksi', '$total')),
              const SizedBox(width: 8),
              Expanded(child: _kpi('Void', '$voids')),
              const SizedBox(width: 8),
              Expanded(child: _kpi('Variance', '$variance')),
              const SizedBox(width: 8),
              Expanded(child: _kpi('Sync Fail', '$failedSync')),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _kpi('Pending Sync', '$pending')),
              const SizedBox(width: 8),
              Expanded(child: _kpi('Conflict', '$conflict')),
              const SizedBox(width: 8),
              Expanded(child: _kpi('Receipt Queue', '$receiptQueue')),
              const SizedBox(width: 8),
              Expanded(child: _kpi('Requests', '${(obs['latest_requests'] as List?)?.length ?? 0}')),
            ],
          ),
          const SizedBox(height: 12),
          SectionCard(
            title: 'Aktivitas Terakhir',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Shift: ${report['has_shift'] == true ? 'open/closed' : 'none'}'),
                Text('Pending events: $pending'),
                Text('Receipt queue: $receiptQueue'),
                const SizedBox(height: 8),
                ElevatedButton(onPressed: _load, child: const Text('Refresh')),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _kpi(String title, String value) {
    return SectionCard(
      title: title,
      child: Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
    );
  }
}