# Simulated UAT Pack (No-Release)

Tujuan: memastikan alur core berjalan **tanpa** outlet nyata / rilis produksi.

## Prasyarat
- Backend Laravel running: `http://127.0.0.1:9000`
- Database siap (dummy data boleh).
- User admin tersedia (`admin/admin`).

## 1) Seed data (menu + meja)
Gunakan seed yang sudah ada:
```
powershell -ExecutionPolicy Bypass -File backend\scripts\_tmp_seed_menu.ps1
```

## 2) Smoke test backend
```
powershell -ExecutionPolicy Bypass -File backend\scripts\smoke.ps1 -BaseUrl "http://127.0.0.1:9000/api/v1"
```

## 3) POS E2E flow (simulasi kasir)
```
powershell -ExecutionPolicy Bypass -File backend\scripts\pos_e2e.ps1
```

## 4) Customer QR flow (simulasi customer)
Buka browser:
- Menu publik: `http://localhost:3001/menu`
- Menu dengan token: `http://localhost:3001/menu?tableToken=...`

## 5) Admin flow (simulasi admin)
Buka:
- `http://localhost:3002`
- Cek Products, Tables, Orders, Kitchen.

## 6) Simulasi load ringan
Jalankan script batch create order 20x:
```
powershell -ExecutionPolicy Bypass -File backend\scripts\uat\simulate-load.ps1 -Count 20
```

## 7) Checklist Simulasi Harian
Gunakan template:
- `docs\uat\templates\simulated-daily-log.md`

## 8) KPI Simulasi
Catat metrik di:
- `docs\uat\templates\simulated-kpi.md`

## Exit Criteria Simulasi
- Smoke test OK.
- POS E2E OK.
- Batch load 20x OK tanpa error fatal.
- Menu tampil dengan gambar dan kategori.
- Admin CRUD Products OK.
- Table QR print OK.

