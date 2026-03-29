import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'package:dio/dio.dart';

import '../core/local_db.dart';
import '../core/app_config_service.dart';
import '../features/ops/sop_content.dart';
import '../pos_app_service.dart';
import '../features/sync/sync_worker.dart';
import 'screens/dashboard_screen.dart';
import 'screens/kitchen_screen.dart';
import 'screens/login_screen.dart';
import 'screens/order_screen.dart';
import 'screens/payment_screen.dart';
import 'screens/receipt_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/shift_screen.dart';
import 'screens/sop_screen.dart';

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
    _autoSyncTimer = Timer.periodic(const Duration(seconds: 30), (_) => _runAutoSync());
    _checkNetwork();
    _netTimer = Timer.periodic(const Duration(seconds: 15), (_) => _checkNetwork());
  bool _syncing = false;
  String _lastSync = '-';
  bool _isOnline = true;
  int _netFailCount = 0;
  int _netOkCount = 0;
  Timer? _netTimer;

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

  Future<void> _checkNetwork() async {
    try {
      final baseUrl = await _config.getString('base_url', fallback: 'http://127.0.0.1:9000');
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
      final baseUrl = await _config.getString('base_url', fallback: 'http://127.0.0.1:9000');
      final dio = Dio(BaseOptions(baseUrl: baseUrl));
      final worker = SyncWorker(dio);
      await worker.pushPull(session.accessToken);
      final now = DateTime.now().toIso8601String();
      await _config.setString('last_sync', now);
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
      case 'Kitchen':
        return KitchenScreen(services: widget.services);
      case 'Reports':
        return ReportsScreen(services: widget.services);
      case 'Settings':
        return SettingsScreen(services: widget.services, onChanged: () async {
          await _loadDeviceName();
          await _refreshPending();
          if (!mounted) return;
          setState(() {});
        });
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
        LogicalKeySet(LogicalKeyboardKey.f4): const _NavIntent('Kitchen'),
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
                      ],
                    ),
                  ),
                ),
              ],
            ),
            backgroundColor: const Color(0xFFF6F5F2),
            drawer: (!_isLoggedIn || !isWide)
                ? Drawer(
                    child: ListView(
                      children: [
                        DrawerHeader(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Color(0xFF0F766E), Color(0xFF0EA5E9)],
                            ),
                          ),
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
                          _drawerItem('Kitchen'),
                          _drawerItem('Reports'),
                          _drawerItem('Settings'),
                          _drawerItem('SOP'),
                        ],
                      ],
                    ),
                  )
                : null,
            body: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFF6F5F2), Color(0xFFE9F5F3)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
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
                        NavigationRailDestination(icon: Icon(Icons.kitchen), label: Text('Kitchen')),
                        NavigationRailDestination(icon: Icon(Icons.bar_chart), label: Text('Reports')),
                        NavigationRailDestination(icon: Icon(Icons.settings), label: Text('Settings')),
                        NavigationRailDestination(icon: Icon(Icons.help), label: Text('SOP')),
                      ],
                    ),
                  Expanded(child: _screen()),
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
    const labels = ['Dashboard', 'Shift', 'Order', 'Payment', 'Receipt', 'Kitchen', 'Reports', 'Settings', 'SOP'];
    return labels.indexOf(_current).clamp(0, labels.length - 1);
  }

  void _setNavByIndex(int index) {
    const labels = ['Dashboard', 'Shift', 'Order', 'Payment', 'Receipt', 'Kitchen', 'Reports', 'Settings', 'SOP'];
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










