import 'package:flutter/material.dart';

import '../../core/observability.dart';
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
  Map<String, dynamic> _summary = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final report = await widget.services.shiftReportService.currentShiftSummary();
    final obs = await _obs.summary();
    if (!mounted) return;
    setState(() {
      _summary = {
        'report': report,
        'obs': obs,
      };
    });
  }

  @override
  Widget build(BuildContext context) {
    final report = (_summary['report'] as Map<String, dynamic>?) ?? {};
    final obs = (_summary['obs'] as Map<String, dynamic>?) ?? {};
    final total = report['total_transaksi'] ?? 0;
    final voids = report['total_void'] ?? 0;
    final variance = report['cash_variance'] ?? '-';
    final failedSync = obs['failed_sync_count'] ?? 0;

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
          SectionCard(
            title: 'Aktivitas Terakhir',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Shift: ${report['has_shift'] == true ? 'open/closed' : 'none'}'),
                Text('Offline queue: $failedSync'),
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
