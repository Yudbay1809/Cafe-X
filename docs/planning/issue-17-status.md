# Issue #17 Status — Master Roadmap POS Cafe-X

Tanggal: 2026-04-07
Sumber: https://github.com/Yudbay1809/Cafe-X/issues/17

Catatan:
- Checklist di GitHub akan auto-check jika linked issues ditutup.
- Dokumen ini mirror status lokal untuk memudahkan tracking.

## Phase 1 — Stabilitas Fondasi
- [x] [101] POS Theme Tokens: rapikan colors.dart dan app_theme.dart
- [x] [102] Base URL config per device/outlet (hapus fallback hardcoded)
- [x] [103] Sync conflict lifecycle: reset status conflict per siklus sync
- [x] [104] Order local ID: migrasi ke UUID untuk hindari collision

## Phase 2 — Kecepatan Kasir
- [x] [105] Quick Add menu + pencarian instan untuk kasir
- [x] [106] Numpad pembayaran cepat (cash exact dan nominal cepat)
- [x] [107] Keyboard shortcuts kasir (F1-F9, Enter, Esc)
- [x] [108] One-tap split bill preset

## Phase 3 — Operasional Outlet
- [x] [109] Printer profile per device (IP/port/paper width)
- [x] [110] Auto-retry print dari receipt_queue + status cetak
- [x] [111] Shift guard ketat: transaksi hanya saat shift aktif
- [x] [112] End-of-shift summary + cash variance alert

## Phase 4 — Reliability & Monitoring
- [x] [113] Sync health dashboard (pending/failed/conflict counters)
- [x] [114] Structured error logging POS + backend correlation id
- [x] [115] SOP recovery mode (offline total, printer down, sync conflict)
- [x] [116] UAT checklist kasir + regression flow transaksi utama