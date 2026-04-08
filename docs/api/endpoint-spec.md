# API Endpoint Specification (Current Baseline)

## Auth
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/logout`
- GET `/api/v1/auth/me`

## Master Data
- GET `/api/v1/master/products`
- GET `/api/v1/master/tables`
- POST `/api/v1/tables/upsert`
- POST `/api/v1/tables/rotate-token`

## Products
- GET `/api/v1/products`
- POST `/api/v1/products`
- PUT `/api/v1/products/{id}`
- DELETE `/api/v1/products/{id}`

## Shift
- POST `/api/v1/shift/open`
- POST `/api/v1/shift/close`

## Orders
- GET `/api/v1/orders`
- POST `/api/v1/orders/create`
- POST `/api/v1/orders/add-item`
- POST `/api/v1/orders/update-item`
- POST `/api/v1/orders/cancel-item`
- POST `/api/v1/orders/status`
- POST `/api/v1/orders/pay`
- POST `/api/v1/orders/cancel`
- GET `/api/v1/orders/{id}`

## QR Customer
- GET `/api/v1/public/menu`
- GET `/api/v1/qr/table-token/{tableCode}`
- POST `/api/v1/qr/place-order`
- GET `/api/v1/qr/order-status/{tableToken}/{orderId}`

## Reports
- GET `/api/v1/reports/summary`
- GET `/api/v1/reports/sales`
- GET `/api/v1/reports/products`
- GET `/api/v1/reports/daily`
- GET `/api/v1/reports/shift`

## Sync
- POST `/api/v1/sync/push`
- POST `/api/v1/sync/pull`

## Billing (Manual v1)
- GET `/api/v1/billing/subscription`
- POST `/api/v1/billing/subscription`
- GET `/api/v1/billing/invoices`
- POST `/api/v1/billing/invoices`
- PATCH `/api/v1/billing/invoices/{id}`
- POST `/api/v1/billing/invoices/{id}/mark-paid`
- POST `/api/v1/billing/demo/reset`

## Filtering
- date range (`from`, `to`)
- outlet/tenant scope from auth context

## Pagination
- `?page=1`
- `?limit=20`
