param(
  [string]$DbName = "dbpemesanan_restore_test",
  [string]$DbUser = "root",
  [string]$DbPass = "",
  [Parameter(Mandatory = $true)][string]$SqlFile
)

$mysql = "C:\\xampp\\mysql\\bin\\mysql.exe"
if (!(Test-Path $mysql)) { throw "mysql client tidak ditemukan: $mysql" }
if (!(Test-Path $SqlFile)) { throw "File SQL tidak ditemukan: $SqlFile" }

if ($DbPass -eq "") {
  & $mysql -u $DbUser -e "CREATE DATABASE IF NOT EXISTS $DbName"
  cmd /c "\"$mysql\" -u $DbUser $DbName < \"$SqlFile\""
} else {
  & $mysql -u $DbUser -p$DbPass -e "CREATE DATABASE IF NOT EXISTS $DbName"
  cmd /c "\"$mysql\" -u $DbUser -p$DbPass $DbName < \"$SqlFile\""
}

Write-Host "RESTORE OK: $DbName"
