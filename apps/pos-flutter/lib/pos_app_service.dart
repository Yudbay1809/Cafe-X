import 'core/api_client.dart';
import 'features/audit/audit_service.dart';
import 'features/auth/auth_service.dart';
import 'features/cache/cache_service.dart';
import 'features/device/backup_service.dart';
import 'features/device/printer_service.dart';
import 'features/order/order_service.dart';
import 'features/ops/smoke_test_service.dart';
import 'features/payment/payment_service.dart';
import 'features/receipt/receipt_service.dart';
import 'features/report/shift_report_service.dart';
import 'features/shift/shift_service.dart';
import 'features/sync/event_queue.dart';
import 'features/table/table_service.dart';
import 'ui/shortcut_bus.dart';

class PosAppService {
  PosAppService(String baseUrl)
    : apiClient = ApiClient(baseUrl: baseUrl),
      auditService = AuditService(),
      eventQueue = EventQueue(),
      backupService = BackupService(),
      shiftReportService = ShiftReportService() {
    authService = AuthService(apiClient);
    cacheService = CacheService(apiClient);
    orderService = OrderService(
      apiClient: apiClient,
      eventQueue: eventQueue,
      cacheService: cacheService,
      auditService: auditService,
    );
    paymentService = PaymentService(
      apiClient: apiClient,
      eventQueue: eventQueue,
      auditService: auditService,
    );
    receiptService = ReceiptService(auditService);
    shiftService = ShiftService(
      apiClient: apiClient,
      eventQueue: eventQueue,
      auditService: auditService,
    );
    tableService = TableService(
      apiClient: apiClient,
      eventQueue: eventQueue,
      auditService: auditService,
    );
    smokeTestService = SmokeTestService(
      authService: authService,
      orderService: orderService,
      paymentService: paymentService,
    );
  }

  final ApiClient apiClient;
  final AuditService auditService;
  final EventQueue eventQueue;
  final BackupService backupService;
  final PrinterService printerService = PrinterService();
  final ShiftReportService shiftReportService;
  final ShortcutBus shortcutBus = ShortcutBus();

  late final AuthService authService;
  late final CacheService cacheService;
  late final OrderService orderService;
  late final PaymentService paymentService;
  late final ReceiptService receiptService;
  late final ShiftService shiftService;
  late final TableService tableService;
  late final SmokeTestService smokeTestService;
}
