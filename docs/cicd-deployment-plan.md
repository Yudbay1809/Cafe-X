# Cafe-X CI/CD & Deployment Plan

This document outlines the CI/CD pipeline and deployment strategy for Cafe-X, covering environment management, build artifacts, migration handling, rollout, and rollback procedures.

## 1) Environments

| Environment | Purpose | Branch | Database | URL |
|------------|--------|-------|---------|------|
| Development | Local dev | `develop` or feature branches | Local PostgreSQL (Docker) | `http://localhost:8000` |
| Staging | Pre-production testing | `staging` | Staging PostgreSQL | `https://staging.cafe-x.example.com` |
| Production | Live service | `main` | Production PostgreSQL | `https://api.cafe-x.example.com` |

## 2) CI/CD Pipeline (GitHub Actions Example)

### Backend Pipeline
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install dependencies
        run: composer install --prefer-dist --optimize-autoloader
      - name: Run tests
        run: php artisan test
      - name: Static analysis
        run: ./vendor/bin/phpstan analyse

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to staging
        run: |
          # SSH to staging server, pull latest, run migrations
          ssh ${{ secrets.STAGING_HOST }} "cd /var/www/cafe-x && git pull origin staging && composer install && php artisan migrate --force"

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          ssh ${{ secrets.PRODUCTION_HOST }} "cd /var/www/cafe-x && git pull origin main && composer install && php artisan migrate --force"
```

### Frontend Pipeline (Next.js apps)
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, staging]
  paths:
    - 'apps/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Build
        run: npm run build
      - name: Test
        run: npm run test

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel/Netlify/cloud
        run: npm run deploy
```

## 3) Artifact Build

### Backend
- **Artifact**: ZIP of `backend/` excluding vendor/, .env, node_modules/
- **Command**: `composer install --no-dev --optimize-autoloader` on target server
- **Static Assets**: Use Laravel Mix or Vite for frontend assets (if any)

### Frontend (Next.js)
- **Artifact**: Build output from `npm run build`
- **Deployment**: Push to edge (Vercel, Netlify, or self-hosted with Docker)

## 4) Database Migrations in CI

### Strategy
1. **Pre-deploy**: Run migrations in CI job before deploy step
2. **Non-destructive**: Always use non-breaking migrations (ADD COLUMN, ADD TABLE)
3. **Rollback**: Test rollback on staging first

### CI Step Example
```yaml
- name: Run migrations
  run: php artisan migrate --force
  env:
    DB_HOST: ${{ secrets.DB_HOST }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

## 5) Rollback Procedures

### Backend Rollback
```bash
# Quick rollback to previous release
ssh ${{ production host }}
cd /var/www/cafe-x
git checkout HEAD~1
composer install
php artisan migrate:rollback
# Or restore DB from backup if schema change was breaking
```

### Database Rollback
1. Restore from `pg_dump` backup taken before migration
2. Verify data integrity
3. Re-run migrations if needed

### Frontend Rollback
- Vercel/Netlify: Use dashboard to roll back to previous deployment
- Self-hosted: Revert git commit and rebuild

## 6) Secrets & Environment Management

| Secret | Usage | Storage |
|--------|-------|---------|
| `DB_HOST`, `DB_PASSWORD` | Database connection | GitHub Secrets |
| `API_TOKEN_SECRET` | Token signing key | GitHub Secrets |
| `SMTP_*` | Email credentials | GitHub Secrets |
| `AWS_*` | Cloud credentials | GitHub Secrets |

`.env` files should never be committed. Use a `.env.example` template.

## 7) Health Checks

- **Laravel**: `GET /api/v1/health` (existing in Shared module)
- **PostgreSQL**: Connection check
- **External APIs**: Status endpoint
- **Monitoring**: Use Laravel Forge / Ploi / CloudWatch for uptime alerts

## 8) Deployment Checklist

- [ ] Tests pass in CI
- [ ] Migrations run successfully on staging
- [ ] Staging smoke tests pass
- [ ] Backup taken before production deploy
- [ ] Migrations run in production CI
- [ ] Health check passes after deploy
- [ ] Rollback plan ready if needed

## 9) Acceptance Criteria

- [ ] CI pipeline runs on every push to main/staging
- [ ] Migrations run automatically in CI
- [ ] Rollback procedures documented and tested
- [ ] Secrets stored securely
- [ ] Health checks operational and monitored

This document will evolve as deployment complexity grows.