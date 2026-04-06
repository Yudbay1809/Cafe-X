param([string]$DbName="dbpemesanan", [string]$OutDir="D:\\Cafe-X-laravel\\backups")
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$dump = Join-Path $OutDir "${DbName}_${ts}.sql"
& C:\xampp\mysql\bin\mysqldump.exe -u root $DbName | Out-File -FilePath $dump -Encoding utf8
Write-Host "Backup saved: $dump"
