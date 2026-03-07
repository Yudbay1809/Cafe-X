param(
  [Parameter(Mandatory = $true)][string]$Date,
  [Parameter(Mandatory = $true)][string]$Outlet
)

$targetDir = "docs/uat/daily"
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
$template = Get-Content "docs/uat/templates/daily-uat-log.md" -Raw
$content = $template.Replace("{{DATE}}", $Date)
$file = Join-Path $targetDir ("uat-log-{0}-{1}.md" -f $Date, $Outlet)
Set-Content -Path $file -Value $content
Write-Host "CREATED: $file"
