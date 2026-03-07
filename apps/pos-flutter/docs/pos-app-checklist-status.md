# POS App Checklist Status

Status saat ini: logic-first implemented.

1. Login kasir + sesi device: done (`AuthService`, `device_sessions`).
2. Open/close shift + cash variance: done (`ShiftService`).
3. Flow order create/add/edit/cancel: done (`OrderService`).
4. Pembayaran multi metode + nominal validasi: done (`PaymentService`).
5. Cetak/reprint struk + audit: done (`ReceiptService`, `AuditService`).
6. Manajemen meja + move + merge/split: done (`TableService`, `OrderService`).
7. Sinkron stok saat add/cancel: done (`CacheService.updateStock` + flow order).
8. Double payment + idempotency key: done (`PaymentService`, `IdempotencyKeyFactory`).
9. Status order strict transition: done (`OrderStateMachine`).
10. Offline mode queue event lokal: done (`EventQueue`, `pending_events`).
11. Worker sync push/pull/retry/conflict: done (`SyncWorker`).
12. Local cache produk/harga/pajak/service/meja: done (`product_cache`, `table_cache`, `app_config`).
13. Error message ramah kasir: done (`error_mapper.dart`).
14. Observability request/latency/failed sync: done (`DeviceObservability` + `device_metrics`).
15. Laporan shift ringkas: done (`ShiftReportService`).
16. Proteksi aksi sensitif role/PIN override: done (`PermissionGuard`).
17. Backup lokal + recovery: done (`BackupService`).
18. Test otomatis rule penting: partial (unit tests added, runtime flutter sdk pending).
19. Smoke test internal: done (`SmokeTestService`).
20. SOP in-app: done (`sop_content.dart`).

Catatan:
- UI final belum dioptimalkan karena fokus logic.
- Integrasi printer fisik butuh implementasi `ReceiptPrinter` per device.
