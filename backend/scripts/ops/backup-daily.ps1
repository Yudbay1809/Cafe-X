param(
  [string]$DbName = "dbpemesanan",
  [string]$DbUser = "root",
  [string]$DbPass = "",
  [string]$BackupDir = ".\\backup"
)

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$file = Join-Path $BackupDir ("{0}_{1}.sql" -f $DbName, $stamp)
$mysqldump = "C:\\xampp\\mysql\\bin\\mysqldump.exe"

if (!(Test-Path $mysqldump)) { throw "mysqldump tidak ditemukan: $mysqldump" }

if ($DbPass -eq "") {
  & $mysqldump -u $DbUser --single-transaction --routines --triggers $DbName > $file
} else {
  & $mysqldump -u $DbUser -p$DbPass --single-transaction --routines --triggers $DbName > $file
}

if (!(Test-Path $file) -or ((Get-Item $file).Length -le 0)) {
  throw "Backup gagal: file kosong"
}

Write-Host "BACKUP OK: $file"
