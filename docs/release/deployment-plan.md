# Deployment Plan (Staging -> Production)

## Pipeline
Workflow: `.github/workflows/deploy-pipeline.yml`

Sequence enforced by pipeline:
1. Lint + test + build (`backend`, `admin-next`, `customer-next`, `pos-flutter analyze`)
2. Package release artifact
3. Deploy ke target (`staging` atau `production`)
4. Jalankan migration `php artisan migrate --force`
5. Health check ke endpoint target
6. Auto rollback gate bila health check gagal

## Trigger
- Manual via GitHub Actions (`workflow_dispatch`)
- Input:
  - `target`: `staging` / `production`
  - `release_name`: optional, default `github.sha`

## Environments
- `staging` environment: deploy otomatis setelah quality gate lulus.
- `production` environment: gunakan GitHub Environment protection (required reviewers).

## Required Secrets
### Staging
- `STAGING_SSH_HOST`
- `STAGING_SSH_USER`
- `STAGING_SSH_KEY`
- `STAGING_DEPLOY_PATH`
- `STAGING_HEALTHCHECK_URL`

### Production
- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_SSH_KEY`
- `PROD_DEPLOY_PATH`
- `PROD_HEALTHCHECK_URL`

## Remote Scripts
- `scripts/deploy/remote-release.sh`
- `scripts/deploy/remote-rollback.sh`

Script `remote-release.sh` melakukan:
- update symlink `current`
- simpan symlink `previous`
- composer install (backend)
- migrate
- cache optimize
- health check
- rollback otomatis ke `previous` jika health gagal

## Rollback SOP
1. Jalankan rollback via script remote:
   - `scripts/deploy/remote-rollback.sh <deploy_path> <health_url>`
2. Verifikasi `/api/v1/health` dan aplikasi web utama.
3. Catat incident di runbook.
