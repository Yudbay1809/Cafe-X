import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'core/app_config_service.dart';
import 'pos_app_service.dart';
import 'ui/home_shell.dart';

void main() {
  runApp(const PosApp());
}

class PosApp extends StatelessWidget {
  const PosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cafe-X POS',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF0F766E),
          secondary: Color(0xFF0EA5E9),
          surface: Color(0xFFF6F5F2),
        ),
        textTheme: GoogleFonts.spaceGroteskTextTheme(),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F766E),
          foregroundColor: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFFF6F5F2),
      ),
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

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final baseUrl = await _config.getString('base_url', fallback: 'http://127.0.0.1:9000');
    if (!mounted) return;
    setState(() => _services = PosAppService(baseUrl));
  }

  @override
  Widget build(BuildContext context) {
    final services = _services;
    if (services == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return HomeShell(services: services);
  }
}
