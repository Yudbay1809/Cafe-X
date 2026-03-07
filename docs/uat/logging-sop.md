# UAT Logging SOP

## 1) Buat file log harian
```powershell
powershell -ExecutionPolicy Bypass -File backend\scripts\uat\new-daily-log.ps1 -Date "2026-03-06" -Outlet "outlet-1"
```

## 2) Isi checklist awal hari
- Buka file di `docs/uat/daily`.
- Centang pre-open checks setelah verifikasi.

## 3) Isi KPI akhir hari
- Update `docs/uat/templates/kpi-tracker.csv` (atau copy ke `docs/uat/daily/kpi-tracker.csv`).
- Isi metrik: error rate, payment success, sync failure, median latency.

## 4) Catat bug/incidents
- Gunakan template `docs/support/templates/bug-report.md`.
- Untuk incident besar gunakan `docs/support/templates/incident-postmortem.md`.

## 5) Kirim ringkasan harian
- Kirim log harian + KPI + daftar bug P1/P2 ke grup operasional.
