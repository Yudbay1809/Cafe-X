import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/app_config_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/colors.dart';
import '../../features/errors/error_mapper.dart';
import '../../pos_app_service.dart';
import '../ui_utils.dart';
import '../widgets/section_card.dart';

// MVP Login Screen - Stitch Design Tokens applied
class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
    required this.services,
    required this.onLogin,
    required this.onLoggedOut,
  });

  final PosAppService services;
  final VoidCallback onLogin;
  final VoidCallback onLoggedOut;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _username = TextEditingController(text: 'admin');
  final _password = TextEditingController(text: 'admin');
  final _deviceName = TextEditingController();
  final _config = AppConfigService();
  bool _loading = false;
  String _status = '';

  @override
  void initState() {
    super.initState();
    _loadDeviceName();
  }

  Future<void> _loadDeviceName() async {
    final name = await _config.getString('device_name', fallback: 'pos-device');
    if (!mounted) return;
    setState(() => _deviceName.text = name);
  }

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _status = '';
    });
    try {
      await _config.setString('device_name', _deviceName.text.trim());
      final session = await widget.services.authService.login(
        username: _username.text.trim(),
        password: _password.text.trim(),
        deviceName: _deviceName.text.trim(),
      );
      setState(() {
        _status = 'Login OK: ${session.username} (${session.roleName})';
      });
      widget.onLogin();
    } catch (e) {
      if (!mounted) return;
      final mapped = toCashierMessage(e);
      setState(() => _status = '$mapped\n\nDETAIL: ${e.toString()}');
      showError(context, e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    setState(() {
      _loading = true;
      _status = '';
    });
    await widget.services.authService.logout();
    if (!mounted) return;
    setState(() {
      _loading = false;
      _status = 'Logout OK';
    });
    widget.onLoggedOut();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.gradientBackground,
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacingXl),
        child: Center(
          child: SizedBox(
            width: 400,
            child: SectionCard(
              title: 'Cafe-X POS',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Login Kasir',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: AppTheme.spacingLg),
                  TextField(
                    controller: _username,
                    decoration: const InputDecoration(labelText: 'Username'),
                  ),
                  const SizedBox(height: AppTheme.spacingMd),
                  TextField(
                    controller: _password,
                    decoration: const InputDecoration(labelText: 'Password'),
                    obscureText: true,
                  ),
                  const SizedBox(height: AppTheme.spacingMd),
                  TextField(
                    controller: _deviceName,
                    decoration: const InputDecoration(labelText: 'Device Name'),
                  ),
                  const SizedBox(height: AppTheme.spacingXl),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _login,
                      child: _loading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Login'),
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingSm),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: _loading ? null : _logout,
                      child: const Text('Logout'),
                    ),
                  ),
                  const SizedBox(height: AppTheme.spacingMd),
                  if (_status.isNotEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(AppTheme.spacingMd),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceDark,
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SelectableText(
                            _status,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const SizedBox(height: AppTheme.spacingSm),
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton.icon(
                              onPressed: () {
                                Clipboard.setData(ClipboardData(text: _status));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Status login disalin'),
                                  ),
                                );
                              },
                              icon: const Icon(Icons.copy, size: 16),
                              label: const Text('Copy'),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
