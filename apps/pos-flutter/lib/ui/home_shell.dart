import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'package:dio/dio.dart';

import '../core/local_db.dart';
import '../core/app_config_service.dart';
import '../core/theme/colors.dart';
import '../features/device/printer_service.dart';
import '../features/ops/sop_content.dart';
import '../features/receipt/receipt_service.dart';
import '../pos_app_service.dart';
import '../features/sync/sync_worker.dart';
import 'screens/dashboard_screen.dart';
import 'screens/login_screen.dart';
import 'screens/order_screen.dart';
import 'screens/payment_screen.dart';
import 'screens/receipt_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/shift_screen.dart';
import 'screens/sop_screen.dart';
import 'screens/device_health_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.services});

  final PosAppService services;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> with SingleTickerProviderStateMixin {
  final _config = AppConfigService();
  String _current = 'Login';
  bool _isLoggedIn = false;
  int _pendingEvents = 0;
  String _deviceName = '';
  String _shiftStatus = 'Shift: -';
  String _userName = '-';
  late final AnimationController _syncController;
  Timer? _sessionTimer;
  Timer? _autoSyncTimer;
  Timer? _netTimer;
  Timer? _printRetryTimer;
  bool _syncing = false;
  bool _printing = false;
  String _lastSync = '-';
  bool _isOnline = true;
  bool _syncConflict = false;
  int _netFailCount = 0;
  int _netOkCount = 0;

  @override
  void initState() {
    super.initState();
    _syncController = AnimationController(vsync: this, duration: const Duration(seconds: 2));
    _refreshPending();
    _loadDeviceName();
    _loadShiftStatus();
    _checkSession();
    _loadUser();
    _sessionTimer = Timer.periodic(const Duration(seconds: 30), (_) => _checkSession());
    _loadLastSync();
    _autoSyncTimer = Timer.periodic(const Duration(seconds: 30), (_) => _runAutoSync());
    _checkNetwork();
    _netTimer = Timer.periodic(const Duration(seconds: 15), (_) => _checkNetwork());
    _printRetryTimer = Timer.periodic(const Duration(minutes: 1), (_) => _runPrintRetry());
  }

  Future<void> _refreshPending() async {
    final count = await _config.getPendingEventCount();
    if (!mounted) return;
    setState(() => _pendingEvents = count);
    if (_pendingEvents > 0) {
      _syncController.repeat();
    } else {
      _syncController.stop();
    }
  }

  Future<void> _loadDeviceName() async {
    final name = await _config.getString('device_name', fallback: 'pos-device');
    if (!mounted) return;
    setState(() => _deviceName = name);
  }

  Future<void> _loadShiftStatus() async {
    final db = await LocalDb.open();
    final rows = await db.query('shifts', where: "status = 'open'", limit: 1);
    if (!mounted) return;
    setState(() => _shiftStatus = rows.isEmpty ? 'Shift: closed' : 'Shift: open');
  }

  Future<void> _loadUser() async {
    final session = await widget.services.authService.currentSession();
    if (!mounted) return;
    setState(() => _userName = session?.username ?? '-');
  }

  Future<void> _checkSession() async {
    final ok = await widget.services.authService.isSessionValid();
    if (!mounted) return;
    setState(() {
      _isLoggedIn = ok;
      _current = ok ? 'Dashboard' : 'Login';
    });
    if (!ok) {
      await widget.services.authService.logout();
      await _loadUser();
    }
  }

  Future<void> _loadLastSync() async {
    final value = await _config.getString('last_sync', fallback: '-');
    if (!mounted) return;
    setState(() => _lastSync = value);
  }

  Future<String?> _baseUrl() async {
    final baseUrl = await _config.getString('base_url', fallback: '');
    if (baseUrl.trim().isEmpty) return null;
    return baseUrl;
  }

  Future<void> _checkNetwork() async {
    try {
      final baseUrl = await _baseUrl();
      if (baseUrl == null) {
        if (mounted) setState(() => _isOnline = false);
        return;
      }
      final dio = Dio(BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 3),
        receiveTimeout: const Duration(seconds: 3),
      ));
      final res = await dio.get('/api/v1/health');
      if (res.statusCode == 200) {
        _netOkCount += 1;
        _netFailCount = 0;
        if (_netOkCount >= 2 && !_isOnline && mounted) {
          setState(() => _isOnline = true);
        }
      } else {
        throw StateError('health failed');
      }
    } catch (_) {
      _netFailCount += 1;
      _netOkCount = 0;
      if (_netFailCount >= 2 && _isOnline && mounted) {
        setState(() => _isOnline = false);
      }
    }
  }

  Future<void> _runAutoSync() async {
    if (_syncing || !_isLoggedIn) return;
    _syncing = true;
    if (!_isOnline) {
      _syncing = false;
      return;
    }
    try {
      final session = await widget.services.authService.currentSession();
      if (session == null) return;
      final baseUrl = await _baseUrl();
      if (baseUrl == null) return;
      final dio = Dio(BaseOptions(baseUrl: baseUrl));
      final worker = SyncWorker(dio);
      final result = await worker.pushPull(session.accessToken);
      final hasConflict = result['has_conflict'] == true;
      if (mounted) setState(() => _syncConflict = hasConflict);
      final now = DateTime.now().toIso8601String();
      await _config.setString('last_sync', now);
      final pending = await _config.getPendingEventCount();
      await _config.setString('sync_health', '{"pending":$pending,"failed":${result['failed']},"conflict":${hasConflict ? 1 : 0}}');
      if (!mounted) return;
      setState(() => _lastSync = now);
      await _refreshPending();
    } catch (_) {
      final now = DateTime.now().toIso8601String();
      await _config.setString('last_sync', 'failed@$now');
      if (mounted) setState(() => _lastSync = 'failed@$now');
    } finally {
      _syncing = false;
    }
  }

  Future<void> _runPrintRetry() async {
    if (_printing || !_isLoggedIn) return;
    _printing = true;
    try {
      final printerIp = await _config.getString('printer_ip', fallback: '');
      if (printerIp.isEmpty) return;
      final printerPort = int.tryParse(await _config.getString('printer_port', fallback: '9100')) ?? 9100;
      final paperWidth = await _config.getString('printer_paper_width', fallback: '80');
      final printer = _QueuePrinter(
        printerService: widget.services.printerService,
        ip: printerIp,
        port: printerPort,
        paperWidth: paperWidth,
      );
      final pending = await widget.services.receiptService.pendingQueueCount();
      if (pending > 0) {
        await widget.services.receiptService.processQueue(printer: printer, limit: 10);
      }
    } finally {
      _printing = false;
    }
  }

  Future<void> _syncNow() async {
    await _runAutoSync();
  }

  Widget _screen() {
    switch (_current) {
      case 'Login':
        return LoginScreen(
          services: widget.services,
          onLogin: () {
            setState(() {
              _isLoggedIn = true;
              _current = 'Dashboard';
            });
            _refreshPending();
            _loadUser();
          },
          onLoggedOut: () {
            setState(() {
              _isLoggedIn = false;
              _current = 'Login';
            });
            _loadUser();
          },
        );
      case 'Dashboard':
        return DashboardScreen(services: widget.services);
      case 'Shift':
        return ShiftScreen(services: widget.services, onChanged: _refreshPending);
      case 'Order':
        return OrderScreen(services: widget.services, onChanged: _refreshPending);
      case 'Payment':
        return PaymentScreen(services: widget.services, onChanged: _refreshPending);
      case 'Receipt':
        return ReceiptScreen(services: widget.services);
      case 'Reports':
        return ReportsScreen(services: widget.services);
      case 'Settings':
        return SettingsScreen(services: widget.services, onChanged: () async {
          await _loadDeviceName();
          await _refreshPending();
          if (!mounted) return;
          setState(() {});
        });
      case 'Device Health':
        return DeviceHealthScreen(services: widget.services);
      case 'SOP':
        return SopScreen(steps: posSopSteps);
      default:
        return const Center(child: Text('Screen not found'));
    }
  }

  @override
  void dispose() {
    _syncController.dispose();
    _sessionTimer?.cancel();
    _autoSyncTimer?.cancel();
    _netTimer?.cancel();
    _printRetryTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 1100;
    return Shortcuts(
      shortcuts: <LogicalKeySet, Intent>{
        LogicalKeySet(LogicalKeyboardKey.f12): const _NavIntent('Dashboard'),
        LogicalKeySet(LogicalKeyboardKey.f1): const _NavIntent('Order'),
        LogicalKeySet(LogicalKeyboardKey.f2): const _NavIntent('Payment'),
        LogicalKeySet(LogicalKeyboardKey.f3): const _NavIntent('Receipt'),
        LogicalKeySet(LogicalKeyboardKey.f5): const _NavIntent('Reports'),
        LogicalKeySet(LogicalKeyboardKey.f6): const _NavIntent('Settings'),
        LogicalKeySet(LogicalKeyboardKey.f7): const _ActionIntent('new_order'),
        LogicalKeySet(LogicalKeyboardKey.f8): const _ActionIntent('quick_pay_cash'),
        LogicalKeySet(LogicalKeyboardKey.f9): const _ActionIntent('quick_pay_qris'),
      },
      child: Actions(
        actions: <Type, Action<Intent>>{
          _NavIntent: CallbackAction<_NavIntent>(
            onInvoke: (intent) {
              setState(() => _current = intent.target);
              return null;
            },
          ),
          _ActionIntent: CallbackAction<_ActionIntent>(
            onInvoke: (intent) {
              widget.services.shortcutBus.emit(intent.action);
              return null;
            },
          ),
        },
        child: Focus(
          autofocus: true,
          child: Scaffold(
            appBar: AppBar(
              title: Text('Cafe-X POS ($_deviceName)'),
              actions: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Center(child: Text(_shiftStatus, style: const TextStyle(color: Colors.white70))),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Center(child: Text('Kasir: $_userName', style: const TextStyle(color: Colors.white70))),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Center(child: Text('Last sync: $_lastSync', style: const TextStyle(color: Colors.white70))),
                ),
                TextButton.icon(
                  onPressed: _isLoggedIn && !_syncing ? _syncNow : null,
                  icon: const Icon(Icons.sync, color: Colors.white),
                  label: const Text('Sync Now', style: TextStyle(color: Colors.white)),
                ),
                TextButton(
                  onPressed: _isLoggedIn
                      ? () async {
                          await widget.services.authService.logout();
                          if (!mounted) return;
                          setState(() {
                            _isLoggedIn = false;
                            _current = 'Login';
                            _userName = '-';
                          });
                        }
                      : null,
                  child: const Text('Logout', style: TextStyle(color: Colors.white)),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Center(
                    child: Row(
                      children: [
                        Icon(
                          _isOnline ? Icons.wifi : Icons.wifi_off,
                          color: _isOnline ? Colors.green.shade200 : Colors.red.shade200,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _isOnline ? 'Online' : 'Offline',
                          style: TextStyle(
                            color: _isOnline ? Colors.green.shade200 : Colors.red.shade200,
                          ),
                        ),
                        const SizedBox(width: 12),
                        RotationTransition(
                          turns: _syncController,
                          child: Icon(
                            Icons.sync,
                            color: _pendingEvents > 0 ? Colors.amber.shade200 : Colors.green.shade200,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Queue: $_pendingEvents',
                          style: TextStyle(
                            color: _pendingEvents > 0 ? Colors.amber.shade200 : Colors.green.shade200,
                          ),
                        ),
                        if (_syncConflict) ...[
                          const SizedBox(width: 12),
                          Icon(Icons.warning, color: Colors.red.shade200),
                          const SizedBox(width: 6),
                          Text('Conflict', style: TextStyle(color: Colors.red.shade200)),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
            backgroundColor: AppColors.surface,
            drawer: (!_isLoggedIn || !isWide)
                ? Drawer(
                    child: ListView(
                      children: [
                        DrawerHeader(
                          decoration: const BoxDecoration(gradient: AppColors.gradientBrand),
                          child: const Align(
                            alignment: Alignment.bottomLeft,
                            child: Text('Cafe-X POS', style: TextStyle(color: Colors.white, fontSize: 20)),
                          ),
                        ),
                        if (!_isLoggedIn) _drawerItem('Login'),
                        if (_isLoggedIn) ...[
                          _drawerItem('Dashboard'),
                          _drawerItem('Shift'),
                          _drawerItem('Order'),
                          _drawerItem('Payment'),
                          _drawerItem('Receipt'),
                          _drawerItem('Reports'),
                          _drawerItem('Settings'),
                          _drawerItem('Device Health'),
                          _drawerItem('SOP'),
                        ],
                      ],
                    ),
                  )
                : null,
            body: Container(
              decoration: const BoxDecoration(gradient: AppColors.gradientBackground),
              child: Column(
                children: [
                  if (_syncConflict)
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.warning, color: Colors.red.shade400),
                          const SizedBox(width: 8),
                          const Expanded(
                            child: Text(
                              'Konflik sync terdeteksi. Periksa log dan lakukan resolve di Settings.',
                              style: TextStyle(color: Color(0xFF7F1D1D)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  Expanded(
                    child: Row(
                      children: [
                        if (isWide && _isLoggedIn)
                          NavigationRail(
                            selectedIndex: _navIndex(),
                            onDestinationSelected: (i) => _setNavByIndex(i),
                            labelType: NavigationRailLabelType.all,
                            destinations: const [
                              NavigationRailDestination(icon: Icon(Icons.dashboard), label: Text('Dashboard')),
                              NavigationRailDestination(icon: Icon(Icons.schedule), label: Text('Shift')),
                              NavigationRailDestination(icon: Icon(Icons.shopping_bag), label: Text('Order')),
                              NavigationRailDestination(icon: Icon(Icons.payments), label: Text('Payment')),
                              NavigationRailDestination(icon: Icon(Icons.receipt), label: Text('Receipt')),
                              NavigationRailDestination(icon: Icon(Icons.bar_chart), label: Text('Reports')),
                              NavigationRailDestination(icon: Icon(Icons.settings), label: Text('Settings')),
                              NavigationRailDestination(icon: Icon(Icons.monitor_heart), label: Text('Device Health')),
                              NavigationRailDestination(icon: Icon(Icons.help), label: Text('SOP')),
                            ],
                          ),
                        Expanded(child: _screen()),
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

  ListTile _drawerItem(String label) {
    return ListTile(
      title: Text(label),
      selected: _current == label,
      onTap: () {
        setState(() => _current = label);
        Navigator.pop(context);
      },
    );
  }

  int _navIndex() {
    const labels = ['Dashboard', 'Shift', 'Order', 'Payment', 'Receipt', 'Reports', 'Settings', 'Device Health', 'SOP'];
    return labels.indexOf(_current).clamp(0, labels.length - 1);
  }

  void _setNavByIndex(int index) {
    const labels = ['Dashboard', 'Shift', 'Order', 'Payment', 'Receipt', 'Reports', 'Settings', 'Device Health', 'SOP'];
    setState(() => _current = labels[index]);
  }
}

class _NavIntent extends Intent {
  const _NavIntent(this.target);

  final String target;
}

class _ActionIntent extends Intent {
  const _ActionIntent(this.action);

  final String action;
}

class _QueuePrinter implements ReceiptPrinter {
  _QueuePrinter({
    required this.printerService,
    required this.ip,
    required this.port,
    required this.paperWidth,
  });

  final PrinterService printerService;
  final String ip;
  final int port;
  final String paperWidth;

  @override
  Future<void> printText(String text) async {
    await printerService.printText(
      ip: ip,
      port: port,
      text: text,
      paperWidth: paperWidth,
    );
  }
}