# UAT Phase 1 Plan (1 Outlet, 1 Week)

## Target Date
- Start: 2026-03-31 (dummy)
- End: 2026-04-06 (dummy)
- Outlet: Outlet-1 (dummy)
- Kasir/Device: 2 kasir
- Jam operasional: 24 jam

## Shift Cadence (24 Jam)
- Shift A: 08:00-16:00
- Shift B: 16:00-00:00
- Shift C: 00:00-08:00

## Daily Checklist (per shift)
- [ ] API health check (`/api/v1/health`) setiap 2 jam.
- [ ] Smoke test awal shift dan akhir shift.
- [ ] Verify login, order create, add item, pay, shift close.
- [ ] POS sync status normal (offline queue = 0 setelah sync).
- [ ] Catat bug severity High/Medium/Low.
- [ ] Rekap error rate, payment success rate, sync failure.

## KPI Target
- Payment success >= 99.5%
- Sync failure <= 1%
- Median API latency <= 300ms
- High severity bug = 0

## Exit Criteria
- Tidak ada incident P1/P2 terbuka.
- KPI target tercapai selama 5 hari berturut-turut.
- Shift close stabil tanpa selisih kas abnormal.

## Output Harian
- `docs/uat/daily/uat-log-YYYY-MM-DD-outlet-1.md`
- `docs/uat/templates/simulated-kpi.md`
