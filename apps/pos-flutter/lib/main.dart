import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

import 'core/app_config_service.dart';
import 'core/theme/app_theme.dart';
import 'pos_app_service.dart';
import 'ui/home_shell.dart';
import 'ui/screens/device_setup_screen.dart';

void main() {
  // Initialize FFI for desktop SQLite
  if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  }
  runApp(const ProviderScope(child: PosApp()));
}

class PosApp extends StatelessWidget {
  const PosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cafe-X POS',
      theme: AppTheme.light(),
      home: const _Bootstrap(),
    );
  }
}

class _Bootstrap extends StatefulWidget {
  const _Bootstrap();

  @override
  State<_Bootstrap> createState() => _BootstrapState();
}

class _BootstrapState extends State<_Bootstrap> {
  final _config = AppConfigService();
  PosAppService? _services;
  bool _needsSetup = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final baseUrl = await _config.getString('base_url', fallback: '');
    if (!mounted) return;
    if (baseUrl.trim().isEmpty) {
      setState(() {
        _needsSetup = true;
        _services = null;
      });
      return;
    }
    setState(() {
      _needsSetup = false;
      _services = PosAppService(baseUrl);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_needsSetup) {
      return DeviceSetupScreen(onSaved: _init);
    }
    final services = _services;
    if (services == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return HomeShell(services: services);
  }
}
