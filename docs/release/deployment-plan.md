# Deployment Plan (Dummy)

## Staging
- Target: staging (dummy)
- Deploy URL: https://staging.cafe-x.local (dummy)
- Rollback gate: manual toggle

## Production
- Target: production (dummy)
- Deploy URL: https://app.cafe-x.local (dummy)
- Health check: /api/v1/health

## Release Policy
- Tag format: vX.Y.Z
- Staging deploy: every tag
- Production deploy: manual approval
