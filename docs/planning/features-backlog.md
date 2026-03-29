# Feature Status & Backlog (Updated 2026-03-30)

Dokumen acuan untuk:
- fitur yang belum dikerjakan
- fitur yang perlu di-update / belum sempurna
- saran fitur tambahan

## A. Belum Dikerjakan
1. Operasional & rollout real:
- UAT fase 1 (1 outlet, 1 minggu)
- UAT fase 2 (3-5 outlet, peak load)
- Cutover tenant lama/new
- Hypercare 14 hari
- KPI produksi nyata

2. Deployment real:
- Auto-deploy staging + rollback gate
- Auto-deploy production + health check
- Release policy ke environment nyata

3. Growth:
- Multi-outlet analytics
- Loyalty
- Integrasi payment/accounting/marketplace

## B. Perlu Di-update / Belum Sempurna
1. Customer app:
- Validasi token meja invalid/expired (UX error lebih jelas)
- Cart key reactivity setelah table lookup
- Session merge saat set table token
- Offline cache menu (fallback when no network)
- Status visual stepper (new -> preparing -> ready -> served)
- Last order history
- Mobile polish (small screen spacing)

2. Admin app:
- Dashboard data real (kartu KPI masih kosong)
- Produk CRUD bulk (import/export)
- Orders list filter lengkap + pagination
- Kitchen board polling backoff + status update
- Tables: batch print selection + layout density tuning

3. POS Flutter:
- Offline status flapping (stability tuning)
- Menu fetch reliability + cache refresh indicator
- Quick pay cash/QRIS shortcuts validation
- Printer ESC/POS integration test matrix
- Sync conflict resolution UI

4. Backend:
- Coverage tambahan untuk edge cases (double payment, concurrency)
- PHPStan baseline + stricter level
- OpenAPI examples consistency check

## C. Saran Fitur Tambahan
1. Customer:
- Favorite menu / reorder
- Promo banner & voucher
- Estimasi waktu tunggu

2. Admin:
- Role-based audit log viewer
- Low-stock alerts
- Shift reconciliation export (CSV)

3. POS:
- PIN override untuk cancel/void high-value
- Offline receipt queue
- Device health page (printer, storage, sync)

4. Ops:
- Auto-backup scheduler UI
- Incident quick report form

