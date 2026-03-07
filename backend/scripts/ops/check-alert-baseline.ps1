param(
  [string]$HealthUrl = "http://127.0.0.1:9000/api/v1/health"
)

$h = Invoke-RestMethod -Method Get -Uri $HealthUrl
$q = [int]$h.data.queue_lag
$s = [int]$h.data.sync_failed_last_hour

if ($q -gt 200 -or $s -gt 30) {
  Write-Host "CRITICAL queue_lag=$q sync_failed_last_hour=$s"
  exit 2
}
if ($q -gt 50 -or $s -gt 10) {
  Write-Host "WARNING queue_lag=$q sync_failed_last_hour=$s"
  exit 1
}
Write-Host "OK queue_lag=$q sync_failed_last_hour=$s"
