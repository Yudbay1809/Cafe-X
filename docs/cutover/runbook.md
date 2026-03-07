# Cutover Runbook

## Pre-cutover
- [ ] Backup verified.
- [ ] Rollback package ready.
- [ ] Freeze window approved.
- [ ] Tenant batch list approved.

## Execution
1. Enable Laravel API as primary.
2. Migrate tenant batch.
3. Run smoke + health checks.
4. Monitor 60 minutes.

## Rollback Trigger
- Payment failure spike.
- Data inconsistency.
- Unrecoverable sync failure.

## Rollback Steps
1. Disable Laravel routing for affected batch.
2. Repoint client to previous backend.
3. Restore DB snapshot if required.
4. Incident report + action items.
