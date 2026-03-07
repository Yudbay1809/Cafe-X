import 'package:flutter/material.dart';

import '../../features/receipt/receipt_service.dart';
import '../../pos_app_service.dart';
import '../../core/app_config_service.dart';
import '../ui_utils.dart';
import '../widgets/section_card.dart';

class ReceiptScreen extends StatefulWidget {
  const ReceiptScreen({super.key, required this.services});

  final PosAppService services;

  @override
  State<ReceiptScreen> createState() => _ReceiptScreenState();
}

class _ReceiptScreenState extends State<ReceiptScreen> implements ReceiptPrinter {
  final _orderId = TextEditingController();
  String _receiptText = '';
  bool _loading = false;
  final _config = AppConfigService();
  String _receiptDir = 'd:\\Cafe-X-laravel\\storage\\pos-receipts';

  Future<void> _loadReceipt() async {
    setState(() => _loading = true);
    try {
      _receiptText = await widget.services.receiptService.buildReceiptText(_orderId.text.trim());
      setState(() {});
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _print({required bool reprint}) async {
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      final printerIp = await _config.getString('printer_ip', fallback: '');
      final printerPort = int.tryParse(await _config.getString('printer_port', fallback: '9100')) ?? 9100;
      if (reprint) {
        await widget.services.receiptService.reprint(
          orderLocalId: _orderId.text.trim(),
          printer: this,
          actor: session.username,
          roleName: session.roleName,
          saveDir: _receiptDir,
        );
      } else {
        await widget.services.receiptService.print(
          orderLocalId: _orderId.text.trim(),
          printer: this,
          actor: session.username,
          roleName: session.roleName,
          saveDir: _receiptDir,
        );
      }
      if (printerIp.isNotEmpty) {
        final text = await widget.services.receiptService.buildReceiptText(_orderId.text.trim());
        await widget.services.printerService.printText(ip: printerIp, port: printerPort, text: text);
      }
      await _loadReceipt();
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    }
  }

  @override
  Future<void> printText(String text) async {
    _receiptText = text;
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _config.getString('receipt_dir', fallback: _receiptDir),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done && snapshot.data is String) {
          _receiptDir = snapshot.data as String;
        }
        return _build(context);
      },
    );
  }

  Widget _build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          SectionCard(
            title: 'Receipt',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(controller: _orderId, decoration: const InputDecoration(labelText: 'Order Local ID')),
                const SizedBox(height: 4),
                Text('Nota akan disimpan dulu ke: $_receiptDir', style: const TextStyle(fontSize: 12)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    ElevatedButton(onPressed: _loading ? null : _loadReceipt, child: const Text('Load')),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _loading ? null : () => _print(reprint: false),
                      child: const Text('Save + Print'),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton(
                      onPressed: _loading ? null : () => _print(reprint: true),
                      child: const Text('Save + Reprint'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: SingleChildScrollView(
                  child: Text(
                    _receiptText,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
