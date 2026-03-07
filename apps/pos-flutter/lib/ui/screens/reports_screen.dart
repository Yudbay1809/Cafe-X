import 'package:flutter/material.dart';

import '../../pos_app_service.dart';
import '../widgets/section_card.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key, required this.services});

  final PosAppService services;

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  Map<String, dynamic> _summary = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await widget.services.shiftReportService.currentShiftSummary();
    if (!mounted) return;
    setState(() => _summary = data);
  }

  @override
  Widget build(BuildContext context) {
    final hasShift = _summary['has_shift'] == true;
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _kpi('Total', '${_summary['total_transaksi'] ?? 0}')),
              const SizedBox(width: 8),
              Expanded(child: _kpi('Void', '${_summary['total_void'] ?? 0}')),
              const SizedBox(width: 8),
              Expanded(child: _kpi('Variance', '${_summary['cash_variance'] ?? '-'}')),
            ],
          ),
          const SizedBox(height: 12),
          SectionCard(
            title: 'Laporan Shift',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (!hasShift) const Text('Belum ada shift'),
                if (hasShift) ...[
                  const Text('Metode bayar:'),
                  ...((_summary['payments'] as List?) ?? const [])
                      .map((p) => Text('- ${p['method']}: ${p['total']}')),
                ],
                const SizedBox(height: 12),
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
