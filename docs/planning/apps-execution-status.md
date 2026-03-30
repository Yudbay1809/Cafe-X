# Apps Execution Status (2026-03-30)

Dokumen ringkas status eksekusi untuk seluruh aplikasi di repo ini.

## Customer (Next.js)
### Completed
- Alur customer: token meja/nomor meja, menu, cart, place order, status order polling.
- Favorite menu + reorder.
- Voucher UI + subtotal/diskon/total (UI).
- Status visual stepper + estimasi waktu tunggu.
- Offline cache menu + error handling token expired.

### In Progress / Planned
- Polishing UI mobile kecil (minor spacing).
- Voucher validasi ke backend (server-side).

### Run Commands
```powershell
cd apps/customer-next
npm install
npm run dev
npm run build
```

## Admin (Next.js)
### Completed
- Pages: dashboard, products, tables + QR print, shifts, orders, reports, kitchen, outlets.
- Audit log viewer (admin).
- Low-stock alerts.
- Shift reconciliation export (CSV).
- Ops pages: backup scheduler UI, incident report form.

### In Progress / Planned
- Hardening data real-time (polling/refresh policies).
- Bulk import/export products (if needed by ops).

### Run Commands
```powershell
cd apps/admin-next
npm install
npm run dev
npm run build
```

## POS (Flutter)
### Completed
- Login + role/session.
- Order flow + payment flow.
- Offline sync queue + retry.
- PIN override for high-value cancel/void.
- Receipt: save/print/reprint + offline receipt queue.
- Device health page.

### In Progress / Planned
- Printer ESC/POS matrix testing on target devices.
- Sync conflict resolution UX polish.

### Run Commands
```powershell
cd apps/pos-flutter
flutter pub get
flutter run -d windows
```

## Backend (Laravel)
### Completed
- API v1 baseline + auth + roles/permissions.
- Orders, payments, shifts, products, tables, QR flow.
- Sync endpoints + idempotency + audit logs.
- Seeders (demo tenant/outlet/admin).

### In Progress / Planned
- Extra edge-case test coverage (double pay, concurrency).
- Production deploy pipeline + health checks.

### Run Commands
```powershell
cd backend
C:\\xampp\\php\\php.exe artisan migrate
C:\\xampp\\php\\php.exe artisan db:seed
C:\\xampp\\php\\php.exe artisan serve --host=127.0.0.1 --port=9000
```

