param(
  [int]$Count = 20,
  [string]$BaseUrl = 'http://127.0.0.1:9000/api/v1'
)

$ErrorActionPreference = 'Stop'

$login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType 'application/json' -Body (@{
  username = 'admin'
  password = 'admin'
  device_name = 'uat-load'
} | ConvertTo-Json)

$token = $login.data.token
$headers = @{ Authorization = "Bearer $token" }

$products = Invoke-RestMethod -Method Get -Uri "$BaseUrl/master/products" -Headers $headers
$tables = Invoke-RestMethod -Method Get -Uri "$BaseUrl/master/tables" -Headers $headers

$prod = $products.data.items[0]
$table = $tables.data.items[0]

if (-not $prod -or -not $table) {
  throw 'No products/tables found. Seed data first.'
}

$created = 0
$failed = 0

for ($i = 1; $i -le $Count; $i++) {
  try {
    $order = Invoke-RestMethod -Method Post -Uri "$BaseUrl/orders/create" -Headers $headers -ContentType 'application/json' -Body (@{
      source = 'POS'
      table_code = $table.table_code
      notes = "load-$i"
    } | ConvertTo-Json)

    $orderId = $order.data.order_id

    Invoke-RestMethod -Method Post -Uri "$BaseUrl/orders/add-item" -Headers $headers -ContentType 'application/json' -Body (@{
      order_id = $orderId
      product_id = $prod.id_menu
      qty = 1
    } | ConvertTo-Json) | Out-Null

    $created++
  } catch {
    $failed++
  }
}

"Load test done: created=$created failed=$failed"
