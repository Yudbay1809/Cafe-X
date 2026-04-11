<#
Automated Live Test Runner for Cafe-X
- Starts backend (Laravel) using PHP from XAMPP
- Starts landing/admin/customer frontends (Next.js)
- Waits for health endpoint backend
- Installs/initializes Playwright if needed
- Runs Playwright tests (headed by default)
- Outputs a consolidated test result
#+
param()

# Paths (adjust if your structure differs)
$backendPath  = "D:\Cafe-X-laravel\backend"
$landingPath  = "D:\Cafe-X-laravel\apps\landing-page"
$adminPath    = "D:\Cafe-X-laravel\apps\admin-next"
$customerPath = "D:\Cafe-X-laravel\apps\customer-next"

# PHP binary (try common install locations)
$phpExe = "C:\xampp\php\php.exe"
if (-not (Test-Path $phpExe)) {
  $phpCmd = Get-Command php -ErrorAction SilentlyContinue
  if ($phpCmd) { $phpExe = $phpCmd.Source }
}

# Logging
$logDir = "D:\Cafe-X-laravel\logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$backendLog   = Join-Path $logDir "backend.log"
$landingLog   = Join-Path $logDir "landing.log"
$adminLog     = Join-Path $logDir "admin.log"
$customerLog  = Join-Path $logDir "customer.log"

# Ensure PHP is in PATH for ease of use (optional)
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
  $xamppPath = "C:\xampp\php"
  if (Test-Path $xamppPath) { $env:PATH += ";$xamppPath" }
}

Write-Output "Starting backend (Laravel) ..."
$procBackend = Start-Process -FilePath $phpExe `
  -ArgumentList "artisan serve --host=127.0.0.1 --port=9000" `
  -WorkingDirectory $backendPath `
  -RedirectStandardOutput $backendLog `
  -RedirectStandardError $backendLog `
  -NoNewWindow -PassThru

Write-Output "Starting landing-page ..."
$procLanding = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c", "npm run dev" `
  -WorkingDirectory $landingPath `
  -RedirectStandardOutput $landingLog `
  -RedirectStandardError $landingLog `
  -NoNewWindow -PassThru

Write-Output "Starting admin-next ..."
$procAdmin = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c", "npm run dev" `
  -WorkingDirectory $adminPath `
  -RedirectStandardOutput $adminLog `
  -RedirectStandardError $adminLog `
  -NoNewWindow -PassThru

Write-Output "Starting customer-next ..."
$procCustomer = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c", "npm run dev" `
  -WorkingDirectory $customerPath `
  -RedirectStandardOutput $customerLog `
  -RedirectStandardError $customerLog `
  -NoNewWindow -PassThru

# Health check
$healthUrl = "http://127.0.0.1:9000/api/v1/health"
$start = Get-Date
$timeoutSec = 120
Write-Output "Waiting for backend health at $healthUrl ..."
while ((Get-Date) -lt $start.AddSeconds($timeoutSec)) {
  try {
    $r = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -eq 200) {
      Write-Output "Backend health OK"
      break
    }
  } catch {
    # ignore and retry
  }
  Start-Sleep -Seconds 2
}

# Playwright setup (install if needed)
if (-not (Test-Path "node_modules/.bin/playwright")) {
  Write-Output "Installing Playwright (devDependency) ..."
  npm i -D @playwright/test
  npx playwright install
}

# Run Playwright tests (headed)
Write-Output "Running Playwright tests (headed) ..."
try {
  $exitCode = & npx playwright test --headed
} catch {
  $exitCode = 1
}
Write-Output "Playwright exit code: $exitCode"

exit $exitCode
