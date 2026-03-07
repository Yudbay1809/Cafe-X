# Alert Baseline

## Source Metric
- `GET /api/v1/health`
  - `queue_lag`
  - `sync_failed_last_hour`

## Threshold
- Warning: `queue_lag > 50`
- Critical: `queue_lag > 200`
- Warning: `sync_failed_last_hour > 10`
- Critical: `sync_failed_last_hour > 30`

## Notification
- Send to on-call channel and email incident group.

## Recovery Action
1. Restart queue worker if queue lag rises continuously.
2. Inspect `pos_sync_logs` failure payload.
3. Trigger incident if critical lasts > 10 minutes.
