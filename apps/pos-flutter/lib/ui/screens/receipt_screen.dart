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
  bool _processingQueue = false;
  int _queueCount = 0;
  final _config = AppConfigService();
  String _receiptDir = 'd:\\Cafe-X-laravel\\storage\\pos-receipts';

  @override
  void initState() {
    super.initState();
    _loadQueueCount();
  }

  Future<void> _loadQueueCount() async {
    final count = await widget.services.receiptService.pendingQueueCount();
    if (!mounted) return;
    setState(() => _queueCount = count);
  }

  Future<void> _processQueue() async {
    setState(() => _processingQueue = true);
    try {
      await widget.services.receiptService.processQueue(printer: this, limit: 20);
      await _loadQueueCount();
    } finally {
      if (mounted) setState(() => _processingQueue = false);
    }
  }

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
      final orderLocalId = _orderId.text.trim();
      final text = await widget.services.receiptService.buildReceiptText(orderLocalId);
      if (reprint) {
        await widget.services.receiptService.reprint(
          orderLocalId: orderLocalId,
          printer: this,
          actor: session.username,
          roleName: session.roleName,
          saveDir: _receiptDir,
          receiptText: text,
        );
      } else {
        await widget.services.receiptService.print(
          orderLocalId: orderLocalId,
          printer: this,
          actor: session.username,
          roleName: session.roleName,
          saveDir: _receiptDir,
          receiptText: text,
        );
      }
      if (printerIp.isNotEmpty) {
        try {
          await widget.services.printerService.printText(ip: printerIp, port: printerPort, text: text);
        } catch (e) {
          await widget.services.receiptService.enqueueFailedPrint(
            orderLocalId: orderLocalId,
            receiptText: text,
            action: reprint ? 'receipt.reprint' : 'receipt.print',
            error: e.toString(),
          );
          if (mounted) showError(context, e);
        }
      }
      await _loadReceipt();
      await _loadQueueCount();
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
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text('Queue: $_queueCount', style: const TextStyle(fontSize: 12)),
                    const SizedBox(width: 8),
                    OutlinedButton(
                      onPressed: _processingQueue ? null : _processQueue,
                      child: Text(_processingQueue ? 'Processing...' : 'Process Queue'),
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
