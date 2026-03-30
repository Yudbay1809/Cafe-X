# UAT Phase 2 Plan (3-5 Outlet)

## Scope
- Outlet count: 3-5
- Peak hour load test: required
- Offline recovery simulation: required

## Validation Matrix
- [ ] Peak hour order burst (min 3x normal volume)
- [ ] Payment concurrency (min 10 transaksi paralel)
- [ ] Device reconnect sync recovery
- [ ] Shift open/close stability
- [ ] End-of-day reporting consistency

## KPI Target
- Error rate <= 0.5%
- Payment success >= 99.5%
- Sync failure <= 1%
- Median API latency <= 300ms

## Exit Criteria
- Error rate dalam SLO
- Tidak ada data loss di skenario offline
- Query latency stabil di peak hour
- Cutover batch 1 siap
