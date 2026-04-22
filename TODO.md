# Cafe-X Next.js Dev Server Fix - TODO

## Plan Breakdown:
1. [x] Create TODO.md (current step)
2. [x] Update customer-next package.json (remove hardcoded port)
3. [x] Update admin-next package.json (remove hardcoded port) 
4. [x] Provide corrected npm run commands for dev servers
5. [x] Suggest npm audit fix
6. [x] Attempt completion with localhost URLs

**Status:** Complete - V1.0 Completed.

---

# ROADMAP: Cafe-X V2.0 (Mobile POS & Cloud HQ Expansion)

## 0. Branding & Customer Portal
- [x] Buat Landing Page premium di halaman utama `customer-next`.
- [x] Integrasi Landing Page dengan alur pemesanan QR.
- [x] Implementasi Real-time Order Tracking (WebSockets).
- [x] Implementasi Dummy Digital Payment (QRIS/E-Wallet).
- [x] Implementasi AI Suggestions (Rekomendasi Menu).
- [x] Setup PWA (Installable App).
- [x] Implementasi Rating & Feedback Pelanggan.

## 1. Backend API Adjustments (Laravel)
- [x] Buat Endpoint `POST /api/v1/sync/pos` untuk menerima sinkronisasi transaksi offline secara *bulk* (massal).
- [x] Buat Endpoint `GET /api/v1/sync/master` untuk mendownload Master Menu, Resep, dan Harga ke *Local DB* Kasir.
- [x] Implementasikan *Conflict Resolution* (Jika ada perubahan stok yang tabrakan antara Offline vs Online).

## 2. Enterprise HQ Dashboard (Admin Next.js)
- [x] Pisahkan fitur Kasir (POS) dan KDS dari halaman Web Admin.
- [x] Tambahkan manajemen cabang (Multi-Outlet) yang lebih komprehensif di *Dashboard*.
- [x] Buat UI untuk memonitor status perangkat POS Mobile di setiap cabang (Online/Offline).
- [x] Implementasi Financial Analytics (Profit & Loss, COGS).
- [x] Implementasi Centralized Inventory & Stock Alerts.
- [x] Implementasi Staff Management & Attendance Monitoring.
- [x] Implementasi CRM (Member Loyalty & Broadcast Promo).
- [x] Implementasi Audit Logs (Security Activity Feed).
- [x] Fitur Export Laporan (PDF/Excel Simulation).

## 3. Mobile POS Application (Advanced)
- [x] Setup proyek *Mobile App* baru dengan arsitektur *Offline-First* Gunakan SQLite
- [x] Buat UI Kasir yang responsif untuk Tablet.
- [x] Integrasi Pesanan Online (QR Portal Polling).
- [x] Implementasi Payment Method (Cash, QRIS, Card).
- [x] Implementasi Pengeluaran (Petty Cash).
- [x] Integrasi Fitur Search & Category Filtering.
- [x] Implementasi Diskon & Tax (Finance Accuracy).
- [x] Implementasi Order Notes (Kustomisasi Item).
- [x] Implementasi X-Report & Settlement Flow.

## 4. V3.0: Enterprise "Sultan" Expansion
- [x] **Kitchen Display System (KDS)**: Tablet-based kitchen queue management.
- [x] **Booking & Reservation**: Online table booking with pre-paid fees.
- [x] **Gamification Loyalty**: Digital Stamp Card system (Buy 9 Get 1).
- [x] **Automated Payroll**: Salary calculation based on attendance & sales commission.
- [x] **Inventory AI Forecasting**: Predict stock needs based on sales trends.
- [x] **Multi-Brand Management**: Manage different cafe brands in one HQ.
