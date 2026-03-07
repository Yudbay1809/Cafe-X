# DB Backup/Restore Runbook (MySQL)

## Scope
- Target database: `dbpemesanan`
- Backup type: full logical backup harian

## Daily backup
```bash
mysqldump -u root -p --single-transaction --routines --triggers dbpemesanan > backup/dbpemesanan_$(date +%F).sql
```

## Verify backup
- Ensure file exists and size is non-zero.
- Run checksum:
```bash
sha256sum backup/dbpemesanan_YYYY-MM-DD.sql
```

## Restore drill (staging)
1. Create empty DB (example `dbpemesanan_restore_test`).
2. Restore:
```bash
mysql -u root -p dbpemesanan_restore_test < backup/dbpemesanan_YYYY-MM-DD.sql
```
3. Run Laravel check:
```bash
php artisan migrate --force
php artisan db:seed --force
php artisan test
```
4. Record success/failure and restore duration.

## Retention
- Keep daily backups for 14 days.
- Keep weekly backups for 8 weeks.
- Store one encrypted offsite copy.

## Incident restore checklist
- Confirm target DB and maintenance window.
- Snapshot current DB before restore.
- Restore latest valid backup.
- Run health endpoint and smoke script.
- Sign-off by owner/admin.
