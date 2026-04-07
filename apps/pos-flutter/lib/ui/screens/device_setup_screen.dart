import 'package:flutter/material.dart';

import '../../core/app_config_service.dart';
import '../../core/theme/colors.dart';

class DeviceSetupScreen extends StatefulWidget {
  const DeviceSetupScreen({super.key, required this.onSaved});

  final Future<void> Function() onSaved;

  @override
  State<DeviceSetupScreen> createState() => _DeviceSetupScreenState();
}

class _DeviceSetupScreenState extends State<DeviceSetupScreen> {
  final _config = AppConfigService();
  final _baseUrl = TextEditingController();
  final _deviceName = TextEditingController();
  String _status = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    _baseUrl.text = await _config.getString('base_url', fallback: '');
    _deviceName.text = await _config.getString('device_name', fallback: 'pos-device');
    if (!mounted) return;
    setState(() {});
  }

  Future<void> _save() async {
    final base = _baseUrl.text.trim();
    if (base.isEmpty) {
      setState(() => _status = 'Base URL wajib diisi');
      return;
    }
    await _config.setString('base_url', base);
    await _config.setString('device_name', _deviceName.text.trim().isEmpty ? 'pos-device' : _deviceName.text.trim());
    setState(() => _status = 'Tersimpan');
    await widget.onSaved();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.gradientBackground),
        child: Center(
          child: SizedBox(
            width: 460,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            gradient: AppColors.gradientBrand,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.store, color: Colors.white),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Setup Device', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                              SizedBox(height: 4),
                              Text('Atur koneksi backend sebelum kasir digunakan.', style: TextStyle(color: AppColors.textMuted)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _baseUrl,
                      decoration: const InputDecoration(labelText: 'Base URL', hintText: 'http://127.0.0.1:9000'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _deviceName,
                      decoration: const InputDecoration(labelText: 'Device Name'),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(onPressed: _save, child: const Text('Simpan & Lanjutkan')),
                    ),
                    if (_status.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(_status, style: const TextStyle(color: AppColors.textMuted)),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}