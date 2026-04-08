import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

import '../../core/app_config_service.dart';
import '../../core/security_utils.dart';
import '../../features/sync/sync_worker.dart';
import '../../pos_app_service.dart';
import '../ui_utils.dart';
import '../widgets/section_card.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, required this.services, required this.onChanged});

  final PosAppService services;
  final VoidCallback onChanged;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _baseUrl = TextEditingController();
  final _deviceName = TextEditingController();
  final _printerIp = TextEditingController();
  final _printerPort = TextEditingController(text: '9100');
  final _printerProfile = TextEditingController();
  String _paperWidth = '80';
  final _cancelThreshold = TextEditingController(text: '500000');
  final _pin = TextEditingController();
  final _config = AppConfigService();
  String _status = '';
  String _pinHint = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    _baseUrl.text = await _config.getString('base_url', fallback: '');
    _deviceName.text = await _config.getString('device_name', fallback: 'pos-device');
    _printerIp.text = await _config.getString('printer_ip', fallback: '');
    _printerPort.text = await _config.getString('printer_port', fallback: '9100');
    _printerProfile.text = await _config.getString('printer_profile', fallback: 'default');
    _paperWidth = await _config.getString('printer_paper_width', fallback: '80');
    _cancelThreshold.text = await _config.getString('cancel_high_threshold', fallback: '500000');
    final pinHash = await _config.getString('manager_pin_hash', fallback: '');
    _pinHint = pinHash.isNotEmpty ? 'PIN terset' : 'Belum ada PIN';
    if (!mounted) return;
    setState(() {});
  }

  Future<void> _save() async {
    await _config.setString('base_url', _baseUrl.text.trim());
    await _config.setString('device_name', _deviceName.text.trim());
    await _config.setString('receipt_dir', 'd:\\Cafe-X-laravel\\storage\\pos-receipts');
    await _config.setString('printer_ip', _printerIp.text.trim());
    await _config.setString('printer_port', _printerPort.text.trim());
    await _config.setString('printer_profile', _printerProfile.text.trim().isEmpty ? 'default' : _printerProfile.text.trim());
    await _config.setString('printer_paper_width', _paperWidth);
    await _config.setString('cancel_high_threshold', _cancelThreshold.text.trim());
    if (_pin.text.trim().isNotEmpty) {
      await _config.setString('manager_pin_hash', hashPin(_pin.text.trim()));
      _pinHint = 'PIN terset';
      _pin.text = '';
    }
    setState(() => _status = 'Saved');
    widget.onChanged();
  }

  Future<void> _backup() async {
    final file = await widget.services.backupService.backupToFile('d:\\Cafe-X-laravel\\storage\\pos-backup');
    setState(() => _status = 'Backup created: ${file.path}');
  }

  Future<void> _restore() async {
    final path = await promptText(context, title: 'Path file backup', hint: 'C:\\path\\backup.json');
    if (!mounted) return;
    if (path == null || path.isEmpty) return;
    try {
      await widget.services.backupService.restoreFromFile(path);
      setState(() => _status = 'Restore OK');
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    }
  }

  Future<void> _syncNow() async {
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      final baseUrl = _baseUrl.text.trim();
      if (baseUrl.isEmpty) throw StateError('Base URL belum diisi');
      final dio = Dio(BaseOptions(baseUrl: baseUrl));
      final worker = SyncWorker(dio);
      final result = await worker.pushPull(session.accessToken);
      setState(() => _status = 'Sync OK: pushed=${result['pushed']} failed=${result['failed']}');
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          SectionCard(
            title: 'Connection',
            child: Column(
              children: [
                TextField(controller: _baseUrl, decoration: const InputDecoration(labelText: 'Base URL')),
                const SizedBox(height: 8),
                Row(
                  children: [
                    ElevatedButton(onPressed: _save, child: const Text('Save')),
                    const SizedBox(width: 8),
                    OutlinedButton(onPressed: _syncNow, child: const Text('Sync Now')),
                  ],
                ),
              ],
            ),
          ),
          SectionCard(
            title: 'Device',
            child: Column(
              children: [
                TextField(controller: _deviceName, decoration: const InputDecoration(labelText: 'Device Name')),
              ],
            ),
          ),
          SectionCard(
            title: 'Printer (ESC/POS)',
            child: Column(
              children: [
                TextField(controller: _printerProfile, decoration: const InputDecoration(labelText: 'Profile Name')),
                const SizedBox(height: 8),
                TextField(controller: _printerIp, decoration: const InputDecoration(labelText: 'Printer IP')),
                TextField(controller: _printerPort, decoration: const InputDecoration(labelText: 'Printer Port')),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: _paperWidth,
                  decoration: const InputDecoration(labelText: 'Paper Width (mm)'),
                  items: const [
                    DropdownMenuItem(value: '58', child: Text('58 mm')),
                    DropdownMenuItem(value: '80', child: Text('80 mm')),
                  ],
                  onChanged: (v) => setState(() => _paperWidth = v ?? '80'),
                ),
              ],
            ),
          ),
          SectionCard(
            title: 'Security',
            child: Column(
              children: [
                TextField(controller: _cancelThreshold, decoration: const InputDecoration(labelText: 'Cancel High Threshold (Rp)')),
                const SizedBox(height: 8),
                TextField(
                  controller: _pin,
                  decoration: InputDecoration(labelText: 'PIN Override (kosongkan jika tidak ubah)', helperText: _pinHint),
                  obscureText: true,
                ),
              ],
            ),
          ),
          SectionCard(
            title: 'Backup & Restore',
            child: Row(
              children: [
                ElevatedButton(onPressed: _backup, child: const Text('Backup')),
                const SizedBox(width: 8),
                OutlinedButton(onPressed: _restore, child: const Text('Restore')),
              ],
            ),
          ),
          if (_status.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_status)),
        ],
      ),
    );
  }
}