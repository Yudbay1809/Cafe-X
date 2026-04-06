param([string]$BaseUrl="http://127.0.0.1:9000/api/v1")
try {
  $res = Invoke-RestMethod "$BaseUrl/health" -Method GET -TimeoutSec 5
  Write-Host "Health OK"
} catch {
  Write-Host "Health FAIL"; exit 1
}
