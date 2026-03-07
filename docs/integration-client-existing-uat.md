# Existing Client Integration (Temporary for UAT)

## Base URL
- Old backend -> replace with: `http://127.0.0.1:9000/api/v1`

## Minimal Mapping
- login -> `/auth/login`
- products -> `/master/products`
- tables -> `/master/tables`
- create order -> `/orders/create`
- add item -> `/orders/add-item`
- pay -> `/orders/pay`
- detail -> `/orders/{orderId}`
- shift open/close -> `/shift/open`, `/shift/close`

## Token
- Save bearer token and send in `Authorization: Bearer <token>`.

## Retry
- For pay/cancel/sync push send `Idempotency-Key` per request.
