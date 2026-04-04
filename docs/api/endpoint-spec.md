# API Endpoint Specification (Draft)

Auth
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

Product
- GET /api/v1/products
- POST /api/v1/products
- PUT /api/v1/products/{id}
- DELETE /api/v1/products/{id}
- GET /api/v1/categories

Order
- GET /api/v1/orders
- POST /api/v1/orders
- GET /api/v1/orders/{id}
- POST /api/v1/orders/{id}/cancel

Order Items
- POST /api/v1/order-items

Payment
- POST /api/v1/payments

Customer
- GET /api/v1/customers
- POST /api/v1/customers

Inventory
- GET /api/v1/inventory
- POST /api/v1/inventory-adjustment

Report
- GET /api/v1/reports/sales
- GET /api/v1/reports/products
- GET /api/v1/reports/daily

POS
- POST /api/v1/pos/sync
- GET /api/v1/pos/config

Filtering
- date range
- outlet_id
- tenant_id

Pagination
- ?page=1
- ?limit=20
