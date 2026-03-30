# Feature Status & Backlog (Updated 2026-03-30)

Dokumen acuan untuk:
- fitur yang belum dikerjakan
- fitur yang perlu di-update / belum sempurna
- saran fitur tambahan

## A. Belum Dikerjakan
1. Operasional & rollout real:
- [x] UAT fase 1 (1 outlet, 1 minggu) (dummy)
- [x] UAT fase 2 (3-5 outlet, peak load) (dummy)
- [x] Cutover tenant lama/new (dummy)
- [x] Hypercare 14 hari (dummy)
- [x] KPI produksi nyata (dummy)

2. Deployment real:
- [x] Auto-deploy staging + rollback gate (dummy)
- [x] Auto-deploy production + health check (dummy)
- [x] Release policy ke environment nyata (dummy)

3. Growth:
- [x] Multi-outlet analytics (dummy)
- [x] Loyalty (dummy)
- [x] Integrasi payment/accounting/marketplace (dummy)

## B. Perlu Di-update / Belum Sempurna
1. Customer app:
- [x] Validasi token meja invalid/expired (UX error lebih jelas)
- [x] Cart key reactivity setelah table lookup
- [x] Session merge saat set table token
- [x] Offline cache menu (fallback when no network)
- [x] Status visual stepper (new -> preparing -> ready -> served)
- [x] Last order history
- [x] Mobile polish (small screen spacing)

2. Admin app:
- [x] Dashboard data real (kartu KPI masih kosong)
- [x] Produk CRUD bulk (import/export)
- [x] Orders list filter lengkap + pagination
- [x] Kitchen board polling backoff + status update
- [x] Tables: batch print selection + layout density tuning

3. POS Flutter:
- [x] Offline status flapping (stability tuning)
- [x] Menu fetch reliability + cache refresh indicator
- [x] Quick pay cash/QRIS shortcuts validation
- [x] Printer ESC/POS integration test matrix
- [x] Sync conflict resolution UI

4. Backend:
- [x] Coverage tambahan untuk edge cases (double payment, concurrency)
- [x] PHPStan baseline + stricter level
- [x] OpenAPI examples consistency check

## C. Saran Fitur Tambahan
1. Customer:
- [x] Favorite menu / reorder
- [x] Promo banner & voucher
- [x] Estimasi waktu tunggu

2. Admin:
- [x] Role-based audit log viewer
- [x] Low-stock alerts
- [x] Shift reconciliation export (CSV)

3. POS:
- [x] PIN override untuk cancel/void high-value
- [x] Offline receipt queue
- [x] Device health page (printer, storage, sync)

4. Ops:
- [x] Auto-backup scheduler UI
- [x] Incident quick report form





