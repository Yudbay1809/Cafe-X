# UAT Phase 1 Plan (1 Outlet, 1 Week)

## Target Date
- Start: ____
- End: ____
- Outlet: ____

## Daily Checklist
- [ ] API health check (`/api/v1/health`) tiap 30 menit.
- [ ] Smoke test awal shift dan akhir shift.
- [ ] Verify login, order create, add item, pay, shift close.
- [ ] Catat bug severity High/Medium/Low.
- [ ] Rekap error rate, payment success rate, sync failure.

## Exit Criteria
- High severity bug = 0
- Payment success >= 99.5%
- Sync failure <= 1%
- Median API latency <= 300ms
