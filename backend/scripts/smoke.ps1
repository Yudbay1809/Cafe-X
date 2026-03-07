param(
  [string]$BaseUrl = "http://127.0.0.1:9000/api/v1",
  [string]$Username = "admin",
  [string]$Password = "admin"
)

$ErrorActionPreference = "Stop"

$login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType "application/json" -Body (@{
  username = $Username
  password = $Password
  device_name = "smoke-script"
} | ConvertTo-Json)

$token = $login.data.token
$headers = @{ Authorization = "Bearer $token"; "Idempotency-Key" = [guid]::NewGuid().ToString() }

$shiftOpenStatus = "skipped"
try {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/shift/open" -Headers $headers -ContentType "application/json" -Body (@{
    opening_cash = 100000
  } | ConvertTo-Json) | Out-Null
  $shiftOpenStatus = "opened"
} catch {
  if ($_.Exception.Message -like "*409*") {
    $shiftOpenStatus = "already_open"
  } else {
    throw
  }
}

$products = Invoke-RestMethod -Method Get -Uri "$BaseUrl/master/products" -Headers $headers
$prod = $products.data.items[0]
if (-not $prod) {
  throw "No products found. Seed menu first."
}

$create = Invoke-RestMethod -Method Post -Uri "$BaseUrl/orders/create" -Headers $headers -ContentType "application/json" -Body (@{ source = "POS" } | ConvertTo-Json)
$orderId = $create.data.order_id

Invoke-RestMethod -Method Post -Uri "$BaseUrl/orders/add-item" -Headers $headers -ContentType "application/json" -Body (@{
  order_id = $orderId
  product_id = $prod.id_menu
  qty = 1
} | ConvertTo-Json) | Out-Null

$detail = Invoke-RestMethod -Method Get -Uri "$BaseUrl/orders/$orderId" -Headers $headers
$total = $detail.data.order.total_amount

$headers["Idempotency-Key"] = [guid]::NewGuid().ToString()
Invoke-RestMethod -Method Post -Uri "$BaseUrl/orders/pay" -Headers $headers -ContentType "application/json" -Body (@{
  order_id = $orderId
  method = "cash"
  amount = $total
} | ConvertTo-Json) | Out-Null

$headers["Idempotency-Key"] = [guid]::NewGuid().ToString()
$cancelStatus = "unexpected"
try {
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/orders/cancel" -Headers $headers -ContentType "application/json" -Body (@{
    order_id = $orderId
    reason = "smoke-cancel"
  } | ConvertTo-Json) | Out-Null
  $cancelStatus = "canceled"
} catch {
  if ($_.Exception.Message -like "*409*") {
    $cancelStatus = "blocked_after_paid"
  } else {
    throw
  }
}

Write-Host "SMOKE OK"
Write-Host "Order:" $orderId
Write-Host "Status after detail:" $detail.data.order.status
Write-Host "Cancel status:" $cancelStatus
Write-Host "Shift:" $shiftOpenStatus
