$ErrorActionPreference = 'Stop'

$base = 'http://127.0.0.1:9000/api/v1'

$login = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{
  username = 'admin'
  password = 'admin'
  device_name = 'pos-test'
} | ConvertTo-Json)

$token = $login.data.token
$headers = @{ Authorization = "Bearer $token" }

try {
  Invoke-RestMethod -Method Post -Uri "$base/shift/open" -Headers $headers -ContentType 'application/json' -Body (@{
    opening_cash = 100000
  } | ConvertTo-Json) | Out-Null
  $shiftOpenMsg = 'opened'
} catch {
  $shiftOpenMsg = 'already_open'
}

$products = Invoke-RestMethod -Method Get -Uri "$base/master/products" -Headers $headers
$tables = Invoke-RestMethod -Method Get -Uri "$base/master/tables" -Headers $headers

$prod = $products.data.items[0]
$table = $tables.data.items[0]

$order = Invoke-RestMethod -Method Post -Uri "$base/orders/create" -Headers $headers -ContentType 'application/json' -Body (@{
  source = 'POS'
  table_code = $table.table_code
  notes = 'e2e'
} | ConvertTo-Json)

$orderId = $order.data.order_id

Invoke-RestMethod -Method Post -Uri "$base/orders/add-item" -Headers $headers -ContentType 'application/json' -Body (@{
  order_id = $orderId
  product_id = $prod.id_menu
  qty = 1
} | ConvertTo-Json) | Out-Null

$detail = Invoke-RestMethod -Method Get -Uri "$base/orders/$orderId" -Headers $headers
$total = $detail.data.order.total_amount

Invoke-RestMethod -Method Post -Uri "$base/orders/pay" -Headers $headers -ContentType 'application/json' -Body (@{
  order_id = $orderId
  method = 'cash'
  amount = $total
} | ConvertTo-Json) | Out-Null

Invoke-RestMethod -Method Post -Uri "$base/orders/receipt" -Headers $headers -ContentType 'application/json' -Body (@{
  order_id = $orderId
} | ConvertTo-Json) | Out-Null

Invoke-RestMethod -Method Post -Uri "$base/orders/reprint" -Headers $headers -ContentType 'application/json' -Body (@{
  order_id = $orderId
} | ConvertTo-Json) | Out-Null

try {
  Invoke-RestMethod -Method Post -Uri "$base/shift/close" -Headers $headers -ContentType 'application/json' -Body (@{
    closing_cash = 100000
    notes = 'e2e close'
  } | ConvertTo-Json) | Out-Null
  $shiftCloseMsg = 'closed'
} catch {
  $shiftCloseMsg = 'close_failed'
}

"E2E OK: order_id=$orderId total=$total shift_open=$shiftOpenMsg shift_close=$shiftCloseMsg"
