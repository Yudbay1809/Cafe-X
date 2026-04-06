# Codex Prompts Execution Status

Tanggal: 2026-04-06
Repo: Cafe-X-laravel

Ringkasan ini memetakan setiap file prompt di `D:\Cafe-X-laravel\codex-prompts` terhadap implementasi aktual di repo.

Legend:
- [x] DONE: sudah diterapkan penuh
- [x] PARTIALLY: sebagian diterapkan, masih ada gap
- [x] NOT YET: belum diterapkan

## Status Per File

- [x] 01_project_overview.txt — DONE
- [x] Struktur monorepo backend/admin/customer/pos sudah terbentuk.
- [x] Tujuan refactor modular untuk SaaS sudah berjalan.

- [x] 02_backend_target_structure.txt — PARTIALLY
- [x] Sudah ada `backend/app/Modules/*` dengan controller/service/DTO dasar.
- [x] Belum semua domain penuh (Tenant/Inventory/Payment/Report/Event/Listener).

- [x] 03_backend_refactor_rules.txt — PARTIALLY
- [x] Service layer sudah dipakai di beberapa modul.
- [x] Masih ada controller yang memuat logic langsung.

- [x] 04_database_improvement_plan.txt — PARTIALLY
- [x] Migration tambahan loyalty/variants/inventory/suppliers/purchase_orders sudah ada.
- [x] Standardisasi nama tabel legacy belum penuh (produk ? products, user ? users).

- [x] 05_api_design_rules.txt — PARTIALLY
- [x] Response wrapper `success` sudah ada via middleware.
- [x] Sebagian endpoint masih memakai `ok` dan belum konsisten.

- [x] 06_admin_frontend_structure.txt — PARTIALLY
- [x] Struktur `features/`, `services/`, `store/`, `hooks/`, `components/` sudah ada.
- [x] Belum semua page dipindahkan ke feature-sliced penuh.

- [x] 07_pos_flutter_structure.txt — PARTIALLY
- [x] Scaffold clean architecture + Riverpod/Isar sudah dibuat.
- [x] Belum semua feature dipindahkan ke layer domain/data/presentation.

- [x] 08_production_readiness_checklist.txt — NOT YET
- [x] Checklist produksi (monitoring, cache/queue, backup automation, hardening) belum semua dilakukan.

- [x] 09_coding_tasks_for_codex.txt — PARTIALLY
- [x] Step 1–5 sudah dijalankan (modules, services, DTO, response formatter).
- [x] Step 6–10 belum sepenuhnya (repo pattern + full refactor FE/Flutter).

- [x] API_endpoint_list.txt — PARTIALLY
- [x] Banyak endpoint sudah tersedia.
- [x] Pagination/filter/response format belum merata di semua endpoint.

- [x] database_sql_codex.txt — PARTIALLY
- [x] Sebagian tabel sudah tersedia via migration.
- [x] Skema legacy belum sepenuhnya dinormalisasi.

- [x] ERD.txt — PARTIALLY
- [x] Banyak entitas sudah ada.
- [x] Beberapa relasi/entitas belum lengkap secara nyata di DB.

- [x] flutter_clean_architecture_prompt.txt — PARTIALLY
- [x] Struktur besar sudah dibuat.
- [x] Migrasi penuh ke domain/data layers masih pending.

- [x] nextjs_shadcn_setup_prompt.txt — PARTIALLY
- [x] Tailwind + shadcn + React Query/Zustand sudah ada.
- [x] Dashboard widgets dan beberapa feature module belum lengkap.

- [x] system_design.txt — DONE (Doc)
- [x] Dokumen desain sistem sudah dibuat dan relevan.

- [x] UI_design_prompt.txt — PARTIALLY
- [x] UI sudah ditingkatkan.
- [x] Design system (warna/typography) belum diterapkan penuh di semua layar.

## Rincian Per Modul

### Backend (Laravel)
DONE:
- [x] Modular routes + module controller proxies
- [x] Service layer dasar (Order/Product/Payment/Inventory/Sync/Audit/Idempotency)
- [x] Response middleware `success` wrapper
- [x] Migrations tambahan untuk loyalty/variants/inventory/suppliers/purchase_orders

PARTIALLY:
- [x] Konsistensi response `success` vs `ok` di seluruh controller
- [x] Standardisasi nama tabel legacy (produk, user, dll)
- [x] Lengkapin semua domain module (Tenant/Outlet/Inventory/Payment/Report)
- [x] DTO/FormRequest cover semua endpoint

NOT YET:
- [x] Repo pattern penuh
- [x] Coverage test edge case (double payment, concurrency)
- [x] OpenAPI examples konsisten

### Admin (admin-next)
DONE:
- [x] Struktur dasar `features/`, `services/`, `store/`, `hooks/`, `components/ui`
- [x] React Query + Zustand + Shadcn setup
- [x] CRUD Products + Tables + Orders list + Audit log + Ops pages

PARTIALLY:
- [x] Feature-sliced penuh (masih ada page logic besar)
- [x] Dashboard widgets real data masih minimal
- [x] Batch print/table UI tuning masih ongoing

NOT YET:
- [x] Full dashboard analytics widgets
- [x] Bulk import/export polish

### POS (pos-flutter)
DONE:
- [x] Scaffold clean architecture + core utilities + Riverpod
- [x] Offline sync worker baseline + device health + receipt queue
- [x] Kitchen flow dihapus total

PARTIALLY:
- [x] Migrasi penuh ke domain/data/presentation layer
- [x] Quick pay validation + printer integration matrix
- [x] Sync conflict resolution UI

NOT YET:
- [x] Complete offline-first polish + full test matrix

### Customer (customer-next)
DONE:
- [x] Menu grid + cart + order status
- [x] Token/meja handling + error handling
- [x] Basic offline cache menu fallback

PARTIALLY:
- [x] UI polish sesuai branding modern
- [x] Status visual stepper polish (mobile)
- [x] Last order history improvements

NOT YET:
- [x] Promo/voucher UI
- [x] Favorite/reorder
- [x] Estimasi waktu tunggu

## Checklist Eksekusi per Fitur/Endpoint

### Backend API (per endpoint)
- [x] POST /api/v1/auth/login — format response success konsisten
- [x] POST /api/v1/auth/logout — response konsisten
- [x] GET /api/v1/auth/me — endpoint tersedia + scope tenant/outlet

- [x] GET /api/v1/products — pagination/filter/sort
- [x] POST /api/v1/products — validation DTO/FormRequest lengkap
- [x] PUT /api/v1/products/{id} — update + audit log
- [x] DELETE /api/v1/products/{id} — soft delete (jika diperlukan)

- [x] GET /api/v1/orders — pagination/filter/status
- [x] POST /api/v1/orders — state transition strict
- [x] GET /api/v1/orders/{id} — detail items lengkap
- [x] POST /api/v1/orders/{id}/cancel — restore stok

- [x] POST /api/v1/order-items — row lock stok

- [x] POST /api/v1/payments — double payment guard + idempotency

- [x] GET /api/v1/customers — basic list
- [x] POST /api/v1/customers — create

- [x] GET /api/v1/inventory — list movement
- [x] POST /api/v1/inventory-adjustment — audit + reason

- [x] GET /api/v1/reports/sales — range filter
- [x] GET /api/v1/reports/products — range filter
- [x] GET /api/v1/reports/daily — summary

- [x] POST /api/v1/pos/sync — push/pull (idempotent)
- [x] GET /api/v1/pos/config — settings

### Admin App (feature checklist)
- [x] Dashboard KPI cards (real data)
- [x] Dashboard sales chart
- [x] Products: bulk import/export polish + error handling
- [x] Products: category filter + low stock badge
- [x] Orders: status update flow (preparing/ready/served)
- [x] Orders: detail drawer/modal polish
- [x] Tables: batch print density tuning
- [x] Tables: checkbox select for batch print
- [x] Reports: sales summary + export CSV
- [x] Settings/Outlets: brand color + contact update

### POS Flutter (feature checklist)
- [x] Login + device binding
- [x] Shift open/close + cash variance
- [x] Order flow (create/add/edit/cancel item)
- [x] Payment multi-method + quick pay shortcuts
- [x] Receipt print/reprint + audit
- [x] Offline queue + retry backoff
- [x] Sync conflict UI
- [x] Product cache refresh indicator
- [x] Device health page (printer/storage/sync)

### Customer Next (feature checklist)
- [x] Menu view with categories + image ratio
- [x] Cart drawer + sticky footer total
- [x] Order status stepper visual
- [x] Last order history
- [x] Offline cache + retry online
- [x] Promo/voucher UI (future)
- [x] Favorite/reorder (future)
- [x] ETA display (future)

## Catatan
- [x] Checklist ini dibuat agar bisa langsung dipakai sebagai urutan eksekusi teknis.
- [x] Jika ingin diprioritaskan (P0/P1/P2), saya bisa tandai per item.








