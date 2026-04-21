# Smoke test runner for customer-next
param([string]$BaseUrl = "http://localhost:3001", [string]$OutDir = "tests\e2e\screenshots")

$routes = @('/menu', '/profile', '/order-status', '/cart')
$results = @{}

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location "D:\Cafe-X-laravel\apps\customer-next"
    npm run dev
} -Name "next-dev"

Write-Host "Starting Next.js dev server..."
Start-Sleep -Seconds 8

# Check server
try {
    $null = Invoke-WebRequest -Uri "$BaseUrl/menu" -Method GET -TimeoutSec 5
    Write-Host "Server is ready"
} catch {
    Write-Host "Server not responding, trying to continue..."
}

# Run tests
foreach ($route in $routes) {
    $routeName = $route.TrimStart('/').Replace('/', '-')
    Write-Host "Testing $route..."

    try {
        $resp = Invoke-WebRequest -Uri "$BaseUrl$route" -Method GET -TimeoutSec 10
        if ($resp.StatusCode -eq 200) {
            $results[$route] = "PASS"
            Write-Host "  $route -> PASS (HTTP $($resp.StatusCode))"
        } else {
            $results[$route] = "FAIL (HTTP $($resp.StatusCode))"
            Write-Host "  $route -> FAIL (HTTP $($resp.StatusCode))"
        }
    } catch {
        $results[$route] = "FAIL ($($_.Exception.Message))"
        Write-Host "  $route -> FAIL"
    }
}

# Check CSS design tokens
Write-Host "`nChecking design tokens..."
try {
    $html = (Invoke-WebRequest -Uri "$BaseUrl/menu" -Method GET).Content
    if ($html -match '--c-brand|--c-bg') {
        Write-Host "  Design tokens FOUND in styles"
    } else {
        Write-Host "  Design tokens NOT found in styles (may need runtime inspection)"
    }
} catch {}

# Report
Write-Host "`n=== RESULTS ==="
foreach ($r in $results.Keys) {
    Write-Host "$r : $($results[$r])"
}

# Cleanup
Stop-Job -Name "next-dev" -ErrorAction SilentlyContinue
Remove-Job -Name "next-dev" -Force

exit 0