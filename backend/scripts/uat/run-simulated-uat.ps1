param(
  [string]$BaseUrl = 'http://127.0.0.1:9000/api/v1',
  [int]$LoadCount = 20
)

$ErrorActionPreference = 'Stop'

Write-Host "[1/4] Seed menu"
& powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\..\_tmp_seed_menu.ps1"

Write-Host "[2/4] Smoke test"
& powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\..\smoke.ps1" -BaseUrl $BaseUrl

Write-Host "[3/4] POS E2E"
& powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\..\pos_e2e.ps1"

Write-Host "[4/4] Load test"
& powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\simulate-load.ps1" -BaseUrl $BaseUrl -Count $LoadCount

Write-Host "Simulated UAT completed"
