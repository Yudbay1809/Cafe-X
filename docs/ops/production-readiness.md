# Production Readiness

## Security
- Auth token enabled
- Rate limit login
- Password hashing
- Validation via FormRequest

## Database
- Foreign keys + indexes
- Backup daily (see scripts/ops/backup-daily.ps1)

## Monitoring
- Health check (scripts/ops/check-health.ps1)
- Queue lag check (scripts/ops/check-queue.ps1)

## Cache/Queue
- Redis configured for cache/queue (env)

## SOP
- Backup/restore runbook in docs/ops

