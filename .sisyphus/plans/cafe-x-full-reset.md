# Cafe-X Full Reset & Fix Work Plan

## TL;DR

> **Quick Summary**: Reset semua database ke PostgreSQL, fix semua koneksi API, pastikan POS Flutter, Admin Next, dan Customer Next berjalan 100%.

> **Deliverables**:
> - Backend Laravel terkoneksi ke PostgreSQL
> - Semua API endpoint berfungsi
> - POS Flutter, Admin Next, Customer Next bisa login dan akses menu
> - Full end-to-end testing pass

> **Estimated Effort**: Large
> **Parallel Execution**: YES - multiple waves
> **Critical Path**: PostgreSQL config → Migrate → Fix API → Test all frontends

---

## Context

### Masalah Saat Ini
1. **POS Flutter** - Connection refused ke `http://127.0.0.1:9000`
2. **Admin Next** - Login gagal (failed to fetch)
3. **Customer Next** - Menu tidak muncul
4. Backend saat ini pakai SQLite → perlu migrate ke PostgreSQL

### Kebutuhan User
- PostgreSQL sudah terinstall
- Reset semua database + fix semua koneksi
- 100% work - no mistakes
- Gunakan semua skill dan MCP yang tersedia

---

## Work Objectives

### Core Objective
Restore full functionality Cafe-X: backend Laravel (PostgreSQL) + 3 frontends (Admin, Customer, POS)

### Concrete Deliverables
1. Backend Laravel terkoneksi ke PostgreSQL
2. API endpoints berfungsi (auth, products, orders, billing)
3. Admin Next bisa login dan akses dashboard
4. Customer Next bisa lihat menu dan pesan
5. POS Flutter bisa login dan akses fungsi kasir

### Definition of Done
- [ ] Backend running di port 9000
- [ ] PostgreSQL database "cafe_x" created dan migrated
- [ ] Admin Next login works (admin/admin)
- [ ] Customer Next menu loads
- [ ] POS Flutter login works

---

## Verification Strategy

### Test Infrastructure
- **Framework**: Manual API testing + Browser testing
- **Tools**: curl, browser devtools, PostgreSQL CLI

### QA Policy
Every task MUST include agent-executed QA scenarios:
- **Backend**: curl API endpoints
- **Frontend**: Browser testing via Playwright/devtools
- **Database**: psql connection test

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - PostgreSQL Setup):
├── T1: Check PostgreSQL connection & create database
├── T2: Update Laravel .env for PostgreSQL
├── T3: Install PostgreSQL PHP driver
├── T4: Run fresh migration
└── T5: Seed initial data (users, categories, products)

Wave 2 (Backend - API Fix):
├── T6: Start Laravel backend server
├── T7: Test all API endpoints
├── T8: Fix any broken routes/controllers
└── T9: Verify auth flow works

Wave 3 (Frontend - Admin & Customer):
├── T10: Setup Admin Next .env.local
├── T11: Start Admin Next & test login
├── T12: Setup Customer Next .env.local  
├── T13: Start Customer Next & test menu
└── T14: Fix any frontend issues

Wave 4 (Frontend - POS Flutter):
├── T15: Verify/update POS API config
├── T16: Test POS login flow
└── T17: Test POS order flow

Wave 5 (Final Integration):
├── T18: Full end-to-end test all flows
├── T19: Document working URLs
└── T20: Clean up test artifacts
```

---

## TODOs

- [ ] 1. **Check PostgreSQL & Create Database**

  **What to do**:
  - Check if PostgreSQL is running
  - Create database "cafe_x" if not exists
  - Verify connection works

  **Acceptance Criteria**:
  - [ ] psql connects to PostgreSQL
  - [ ] Database "cafe_x" exists

  **QA Scenarios**:
  ```
  Scenario: PostgreSQL connection test
    Tool: Bash (psql)
    Steps:
      1. psql -U postgres -c "\l" (list databases)
      2. Verify cafe_x exists or create it
    Expected Result: Database listed
  ```

- [ ] 2. **Update Laravel .env for PostgreSQL**

  **What to do**:
  - Update backend/.env:
    ```
    DB_CONNECTION=pgsql
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_DATABASE=cafe_x
    DB_USERNAME=postgres
    DB_PASSWORD=zgz123-ZGZ7
    ```
  - Clear config cache

  **Acceptance Criteria**:
  - [ ] .env updated with PostgreSQL config
  - [ ] php artisan config:clear runs

- [ ] 3. **Install PostgreSQL PHP Driver**

  **What to do**:
  - Install pdo_pgsql extension if not available
  - Check via php -m

  **Acceptance Criteria**:
  - [ ] php -m shows pdo_pgsql

- [ ] 4. **Run Fresh Migration**

  **What to do**:
  - php artisan migrate:fresh --seed
  - Or create tables manually if issues

  **Acceptance Criteria**:
  - [ ] All tables created
  - [ ] Seed data inserted

- [ ] 5. **Seed Initial Data**

  **What to do**:
  - Create seed for:
    - Users (admin: admin/admin)
    - Categories
    - Products
    - Tables

  **Acceptance Criteria**:
  - [ ] Admin user exists
  - [ ] Products available

- [ ] 6. **Start Laravel Backend**

  **What to do**:
  - Run: php artisan serve --host=127.0.0.1 --port=9000
  - Verify listening

  **Acceptance Criteria**:
  - [ ] Server running on 127.0.0.1:9000

- [ ] 7. **Test API Endpoints**

  **What to do**:
  - Test auth: POST /api/v1/auth/login
  - Test products: GET /api/v1/products
  - Test categories: GET /api/v1/categories

  **Acceptance Criteria**:
  - [ ] Auth returns token
  - [ ] Products returns data

- [ ] 8. **Fix Broken Routes/Controllers**

  **What to do**:
  - Check routes/api.php
  - Verify controllers exist
  - Fix any 404/500 errors

  **Acceptance Criteria**:
  - [ ] All key endpoints return 200

- [ ] 9. **Verify Auth Flow**

  **What to do**:
  - Test login with admin/admin
  - Test protected endpoints with token

  **Acceptance Criteria**:
  - [ ] Login returns user + token
  - [ ] Token works for protected routes

- [ ] 10. **Setup Admin Next .env.local**

  **What to do**:
  - cp .env.example .env.local
  - Ensure NEXT_PUBLIC_API_BASE=http://127.0.0.1:9000/api/v1

  **Acceptance Criteria**:
  - [ ] .env.local exists with correct API URL

- [ ] 11. **Start Admin Next & Test Login**

  **What to do**:
  - npm run dev -- --port 3002
  - Open http://127.0.0.1:3002
  - Login with admin/admin

  **Acceptance Criteria**:
  - [ ] Login page loads
  - [ ] Login successful
  - [ ] Dashboard accessible

- [ ] 12. **Setup Customer Next .env.local**

  **What to do**:
  - cp .env.example .env.local
  - Ensure NEXT_PUBLIC_API_BASE=http://127.0.0.1:9000/api/v1

  **Acceptance Criteria**:
  - [ ] .env.local exists with correct API URL

- [ ] 13. **Start Customer Next & Test Menu**

  **What to do**:
  - npm run dev -- --port 3001
  - Open http://127.0.0.1:3001
  - Enter table token
  - View menu

  **Acceptance Criteria**:
  - [ ] Menu page loads
  - [ ] Products displayed

- [ ] 14. **Fix Frontend Issues**

  **What to do**:
  - Fix any console errors
  - Fix API calls if needed

  **Acceptance Criteria**:
  - [ ] No critical errors in console

- [ ] 15. **Verify POS API Config**

  **What to do**:
  - Check POS Flutter API configuration
  - Ensure points to http://127.0.0.1:9000

  **Acceptance Criteria**:
  - [ ] POS configured to correct backend URL

- [ ] 16. **Test POS Login Flow**

  **What to do**:
  - Run POS Flutter app
  - Login with admin credentials

  **Acceptance Criteria**:
  - [ ] Login successful
  - [ ] Dashboard accessible

- [ ] 17. **Test POS Order Flow**

  **What to do**:
  - Create order from POS
  - Verify order appears in backend

  **Acceptance Criteria**:
  - [ ] Order created successfully

- [ ] 18. **Full End-to-End Test**

  **What to do**:
  - Admin creates product
  - Customer orders
  - POS sees order
  - Payment processed

  **Acceptance Criteria**:
  - [ ] All flows work

- [ ] 19. **Document Working URLs**

  **What to do**:
  - Document all running services

  **Acceptance Criteria**:
  - [ ] URLs documented

- [ ] 20. **Clean Up**

  **What to do**:
  - Remove test artifacts
  - Delete err.json

  **Acceptance Criteria**:
  - [ ] Clean working directory

---

## Final Verification Wave

- [ ] F1. **Backend Health** - Laravel running on 9000, PostgreSQL connected
- [ ] F2. **API Health** - All endpoints return 200
- [ ] F3. **Admin Login** - Works with admin/admin
- [ ] F4. **Customer Menu** - Products display
- [ ] F5. **POS Login** - Works

---

## Success Criteria

### Verification Commands
```bash
# Backend
curl -X POST http://127.0.0.1:9000/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}'

# Products
curl -H "Authorization: Bearer [TOKEN]" http://127.0.0.1:9000/api/v1/products
```

### Final Checklist
- [ ] PostgreSQL database created
- [ ] Laravel connected to PostgreSQL
- [ ] All migrations run
- [ ] Admin Next login works
- [ ] Customer Next menu works
- [ ] POS Flutter login works