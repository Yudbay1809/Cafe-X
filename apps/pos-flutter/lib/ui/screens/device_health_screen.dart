import 'package:flutter/material.dart';

import '../../core/app_config_service.dart';
import '../../core/local_db.dart';
import '../../pos_app_service.dart';
import '../widgets/section_card.dart';

class DeviceHealthScreen extends StatefulWidget {
  const DeviceHealthScreen({super.key, required this.services});

  final PosAppService services;

  @override
  State<DeviceHealthScreen> createState() => _DeviceHealthScreenState();
}

class _DeviceHealthScreenState extends State<DeviceHealthScreen> {
  final _config = AppConfigService();
  bool _loading = false;
  String _deviceName = '-';
  String _baseUrl = '-';
  String _printerIp = '-';
  String _printerPort = '-';
  String _lastSync = '-';
  int _pendingEvents = 0;
  int _receiptQueue = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final deviceName = await _config.getString('device_name', fallback: 'pos-device');
      final baseUrl = await _config.getString('base_url', fallback: 'http://127.0.0.1:9000');
      final printerIp = await _config.getString('printer_ip', fallback: '-');
      final printerPort = await _config.getString('printer_port', fallback: '9100');
      final lastSync = await _config.getString('last_sync', fallback: '-');
      final pendingEvents = await _config.getPendingEventCount();
      final db = await LocalDb.open();
      final receiptRows = await db.rawQuery("SELECT COUNT(*) AS total FROM receipt_queue WHERE status = 'pending'");
      final receiptQueue = (receiptRows.first['total'] as int?) ?? 0;
      if (!mounted) return;
      setState(() {
        _deviceName = deviceName;
        _baseUrl = baseUrl;
        _printerIp = printerIp.isEmpty ? '-' : printerIp;
        _printerPort = printerPort;
        _lastSync = lastSync;
        _pendingEvents = pendingEvents;
        _receiptQueue = receiptQueue;
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          SectionCard(
            title: 'Device Health',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: _loading ? null : _load,
                      child: Text(_loading ? 'Loading...' : 'Refresh'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _infoRow('Device Name', _deviceName),
                _infoRow('Base URL', _baseUrl),
                _infoRow('Printer IP', _printerIp),
                _infoRow('Printer Port', _printerPort),
                _infoRow('Last Sync', _lastSync),
                _infoRow('Pending Events', _pendingEvents.toString()),
                _infoRow('Receipt Queue', _receiptQueue.toString()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(width: 140, child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
