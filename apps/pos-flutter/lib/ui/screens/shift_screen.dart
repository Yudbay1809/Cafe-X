import 'package:flutter/material.dart';

import '../../pos_app_service.dart';
import '../ui_utils.dart';
import '../widgets/section_card.dart';

class ShiftScreen extends StatefulWidget {
  const ShiftScreen({super.key, required this.services, required this.onChanged});

  final PosAppService services;
  final VoidCallback onChanged;

  @override
  State<ShiftScreen> createState() => _ShiftScreenState();
}

class _ShiftScreenState extends State<ShiftScreen> {
  final _opening = TextEditingController(text: '100000');
  final _closing = TextEditingController(text: '100000');
  final _notes = TextEditingController();
  String _status = '';
  bool _loading = false;
  Map<String, dynamic>? _lastClose;

  Future<void> _open() async {
    setState(() {
      _loading = true;
      _status = '';
    });
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      await widget.services.shiftService.openShift(
        token: session.accessToken,
        actor: session.username,
        roleName: session.roleName,
        openingCash: double.parse(_opening.text),
      );
      setState(() => _status = 'Shift opened');
      widget.onChanged();
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _close() async {
    setState(() {
      _loading = true;
      _status = '';
    });
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) throw StateError('Belum login');
      final result = await widget.services.shiftService.closeShift(
        token: session.accessToken,
        actor: session.username,
        roleName: session.roleName,
        closingCash: double.parse(_closing.text),
        notes: _notes.text.trim(),
      );
      final variance = (result['cash_variance'] as num?)?.toDouble() ?? 0;
      final alert = variance.abs() >= 10000 ? ' (Perlu review)' : '';
      setState(() {
        _status = 'Shift closed. Variance: $variance$alert';
        _lastClose = result;
      });
      widget.onChanged();
    } catch (e) {
      if (!mounted) return;
      showError(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: SectionCard(
              title: 'Open Shift',
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _opening,
                      decoration: const InputDecoration(labelText: 'Opening Cash'),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(onPressed: _loading ? null : _open, child: const Text('Open')),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: SectionCard(
              title: 'Close Shift',
              child: Column(
                children: [
                  TextField(controller: _closing, decoration: const InputDecoration(labelText: 'Closing Cash'), keyboardType: TextInputType.number),
                  TextField(controller: _notes, decoration: const InputDecoration(labelText: 'Notes')),
                  const SizedBox(height: 8),
                  ElevatedButton(onPressed: _loading ? null : _close, child: const Text('Close')),
                  if (_status.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(_status, style: const TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  if (_lastClose != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Expected Cash: ${_lastClose!['expected_cash']}'),
                          Text('Closing Cash: ${_lastClose!['closing_cash']}'),
                          Text('Variance: ${_lastClose!['cash_variance']}'),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}