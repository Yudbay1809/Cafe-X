# QA Test Report - customer-next
**Date:** 2026-04-20
**URL:** http://localhost:3001

## Test Results

| Test | Page | Status | Notes |
|------|------|--------|-------|
| 1 | /menu | FAIL | Backend API not running (ERR_CONNECTION_REFUSED to 127.0.0.1:9000) |
| 2 | /profile | PASS | Page loads with profile UI |
| 3 | /cart | PASS | Page loads with cart UI |
| 4 | Design Tokens | PASS | Premium Luxe theme applied |

## Details

### Test 1: /menu
- **Status:** FAIL
- **Issue:** Page loads but shows "Failed to fetch" - backend API not running
- **Console Error:** `net::ERR_CONNECTION_REFUSED @ http://127.0.0.1:9000/api/v1/public/menu`
- **UI Elements:** Logo, search bar, promo banner, table picker, voucher input, category chips present
- **Screenshot:** test-menu.png

### Test 2: /profile
- **Status:** PASS
- **Page loads:** Cafe-X Customer
- **Screenshot:** test-profile.png

### Test 3: /cart
- **Status:** PASS
- **Page loads:** Cafe-X Customer
- **Screenshot:** test-cart.png

### Test 4: Design Tokens
- **Status:** PASS
- **Font Family:** Plus Jakarta Sans (body), Newsreader (headings)
- **Theme:** Premium Luxe via data-theme="premium"
- **Colors from CSS vars:**
  - `--cx-primary: #1a0f0a` (Premium dark)
  - `--cx-secondary: #b8860b` (gold accent)
  - `--cx-surface: #fdfbf7`
  - `--cx-font-display: 'Newsreader', Georgia, serif`
  - `--cx-font-body: 'Plus Jakarta Sans', system-ui, sans-serif`

## Prerequisites for Full Test
Start Laravel backend:
```
cd backend
php artisan serve --host=127.0.0.1 --port=9000
```