# API Design Standard

Base URL: `/api/v1`

Success format:
```json
{ "success": true, "message": "optional", "data": {} }
```

Error format:
```json
{ "success": false, "message": "validation error", "errors": {} }
```

Status codes:
- 200 success
- 201 created
- 400 validation error
- 401 unauthorized
- 403 forbidden
- 404 not found
- 500 server error

Endpoint grouping:
- /auth
- /products
- /orders
- /payments
- /reports
- /customers
- /inventory

Pagination, filtering, sorting required where applicable.
