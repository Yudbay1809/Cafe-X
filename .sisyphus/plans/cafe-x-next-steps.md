# Cafe-X Next Steps Plan

## Overview

**Project**: Cafe-X Monorepo (Laravel + 3 Next.js apps)
**Goal**: Verify backend connectivity, run E2E tests, and ensure all apps work correctly
**Created**: 2026-04-13

---

## Wave 1: Backend & API Readiness

### 1.1 Start Backend Server

**Task**: Ensure Laravel backend is running on port 9000

```powershell
cd backend
php artisan serve --host=127.0.0.1 --port=9000
```

**Verification**:
```powershell
curl http://127.0.0.1:9000/api/v1/health
```

**Acceptance Criteria**:
- [ ] Backend responds with JSON (not connection refused)
- [ ] API v1 endpoint accessible
- [ ] No CORS errors in response headers

---

### 1.2 Test Login API

**Task**: Verify auth/login endpoint works with seed credentials

**Test Command**:
```powershell
curl -X POST http://127.0.0.1:9000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@example.com","password":"admin"}'
```

**Acceptance Criteria**:
- [ ] Returns 200 with token OR 401 if credentials wrong
- [ ] No "Connection refused" error

---

### 1.3 Verify CORS & Base URL

**Task**: Check CORS headers and API base URL configuration

**Check**:
- Backend .env: `APP_URL=http://127.0.0.1:9000`
- Frontend .env.local: `NEXT_PUBLIC_API_URL=http://127.0.0.1:9000/api/v1`

**Acceptance Criteria**:
- [ ] CORS allows localhost origins
- [ ] All 3 frontends have correct API base URL

---

## Wave 2: Frontend Builds & Dev Tests

### 2.1 Build All Frontends

**Task**: Run production build for all apps

```powershell
# Build admin-next
cd apps/admin-next
npm run build

# Build customer-next
cd apps/customer-next
rm -r .next  # Clear cache if needed
npm run build

# Build landing-page
cd apps/landing-page
npm run build
```

**Acceptance Criteria**:
- [ ] admin-next builds without errors
- [ ] customer-next builds without errors
- [ ] landing-page builds without errors

---

### 2.2 Run Playwright E2E Tests

**Task**: Execute E2E tests for admin and customer flows

```powershell
# Admin tests
cd apps/admin-next
npx playwright test

# Customer tests
cd apps/customer-next
npx playwright test
```

**Acceptance Criteria**:
- [ ] Admin login test passes
- [ ] Customer menu access test passes
- [ ] No critical failures blocking basic functionality

---

## Wave 3: Integration Validation

### 3.1 Test Core Flows

**Task**: Verify key user flows work end-to-end

1. **Admin Flow**: Login → Dashboard → Orders
2. **Customer Flow**: Enter table → View menu → Add to cart → Checkout

**Manual Test Commands** (if needed):
```powershell
# Start dev server
cd apps/admin-next
npm run dev -- --port 3002

cd apps/customer-next
npm run dev -- --port 3001
```

**Acceptance Criteria**:
- [ ] Admin can login and see dashboard
- [ ] Customer can view menu and add items to cart
- [ ] No JavaScript console errors on page load

---

### 3.2 Document Results

**Task**: Record test results and any issues found

**Output Format**:
```markdown
## Test Results - [Date]

### Build Status
| App | Status |
|-----|--------|
| admin-next | PASS/FAIL |
| customer-next | PASS/FAIL |
| landing-page | PASS/FAIL |

### E2E Tests
| Test | Status |
|------|--------|
| Admin Login | PASS/FAIL |
| Customer Menu | PASS/FAIL |

### Issues Found
- [List any blocking issues]
```

---

## Quick Start Commands

```powershell
# 1. Start backend
cd backend
php artisan serve --host=127.0.0.1 --port=9000

# 2. In new terminal - start admin
cd apps/admin-next
npm run dev -- --port 3002

# 3. In new terminal - start customer
cd apps/customer-next
npm run dev -- --port 3001

# 4. In new terminal - start landing
cd apps/landing-page
npm run dev
```

## Environment Summary

| Service | URL | Port |
|---------|-----|------|
| Laravel API | http://127.0.0.1 | 9000 |
| Admin Next.js | http://127.0.0.1 | 3002 |
| Customer Next.js | http://127.0.0.1 | 3001 |
| Landing Page | http://localhost | 3000 |

---

## Notes

- Backend must be running BEFORE starting frontends
- If connection error persists, check XAMPP/Apache is not blocking port 9000
- Clear `.next` cache if build shows stale errors: `Remove-Item -Path .next -Recurse -Force`