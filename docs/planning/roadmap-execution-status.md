# Roadmap Execution Status (Updated 2026-03-06)

## Selesai di kode/runtime
- Backend Laravel v1 berjalan di port 9000.
- Enum order/payment sudah locked dan dipakai di validation + migration.
- Auth token + revoke + expiry + role/permission middleware aktif.
- Context request (`auth_user`, tenant, outlet) aktif.
- Master/Shift/Order/QR/Sync controller aktif.
- Service layer transaksi aktif (`PosService`, `ShiftService`, `StockService`, `SyncService`).
- Idempotency replay aktif untuk endpoint kritikal.
- Audit trail aktif untuk aksi kritikal.
- Structured logging + sanitized error handler aktif.
- Health endpoint + queue/sync metric aktif.
- OpenAPI v1 + changelog + Postman collection/env tersedia.
- Smoke script runtime tersedia dan lolos.
- Test suite otomatis tersedia dan lolos (37 tests pass).
- Regression 27 scenario status transition tersedia (`OrderStateRegression27Test`).
- Release packaging dasar aktif via plan feature gate (`basic/pro/premium`).
- Report summary endpoint terlindungi `perm + feature`.
- Backup/restore scripts dan runbook tersedia.
- UAT/cutover/go-live/hypercare docs tersedia.
- Next.js customer/admin + Flutter POS foundation scaffold tersedia.

## Butuh eksekusi operasional nyata (tidak bisa disimulasikan penuh dari kode)
- UAT fase 1 (1 outlet, 1 minggu parallel run).
- UAT fase 2 (3-5 outlet, peak load, offline recovery real device).
- Integrasi client existing di lingkungan outlet nyata.
- Cutover bertahap tenant lama/new tenant routing.
- Hypercare 14 hari dengan SLA on-call nyata.
- KPI produksi nyata (error rate, payment success, churn signal) setelah traffic live.

## Perintah eksekusi utama
```powershell
# start API
C:\xampp\php\php.exe artisan serve --host=127.0.0.1 --port=9000

# test otomatis
C:\xampp\php\php.exe artisan test

# smoke runtime
powershell -ExecutionPolicy Bypass -File backend\scripts\smoke.ps1 -BaseUrl "http://127.0.0.1:9000/api/v1"

# backup harian
powershell -ExecutionPolicy Bypass -File backend\scripts\ops\backup-daily.ps1

# restore drill
powershell -ExecutionPolicy Bypass -File backend\scripts\ops\restore-test.ps1 -SqlFile ".\backup\dbpemesanan_YYYY-MM-DD_HHMMSS.sql"
```

## POS Kasir Update (2026-03-06)
- Added endpoints: update-item, cancel-item, move-table, merge, split, receipt, reprint, report shift.
- Added service transactional logic for item edit/cancel and table/order operations.
- Added high-value cancel guard with supervisor permission.
- Added regression tests for new cashier flows.
- Added SOP and operational docs for cashier and device recovery.
