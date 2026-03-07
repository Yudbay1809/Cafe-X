# Frontend Next.js Execution Status (2026-03-06)

## Completed
- Customer app flow: token input, menu, cart, place order, order status polling.
- Admin app flow: login, products/tables/shifts/orders/reports/kitchen pages.
- Shared API wrappers with request-id and error handling.
- E2E tests with Playwright for both apps.
- Frontend CI workflow: build + playwright e2e (customer/admin).
- Backend endpoints added for customer QR flow (`/qr/menu`, `/qr/place-order`, `/qr/order-status`).

## Run Commands
```powershell
# Customer
cd apps/customer-next
npm install
npm run dev
npm run build
npm run test:e2e

# Admin
cd apps/admin-next
npm install
npm run dev
npm run build
npm run test:e2e
```
