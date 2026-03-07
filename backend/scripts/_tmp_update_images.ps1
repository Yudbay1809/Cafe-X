$backendRoot = Split-Path -Parent $PSScriptRoot
$productsJson = & C:\xampp\php\php.exe (Join-Path $PSScriptRoot "_tmp_list_products.php")
$products = $productsJson | ConvertFrom-Json
$map = @()
foreach ($p in $products) {
  $name = ($p.nama_menu -replace '[^a-zA-Z0-9\s-]', '').Trim()
  $slug = ($name -replace '\s+', '-').ToLower()
  if ([string]::IsNullOrWhiteSpace($slug)) { $slug = "menu-$($p.id_menu)" }
  $query = $name
  if ([string]::IsNullOrWhiteSpace($query)) { $query = "food" }
  $urls = @(
    "https://source.unsplash.com/900x900/?$([uri]::EscapeDataString($query))",
    "https://source.unsplash.com/featured/900x900/?$([uri]::EscapeDataString($query))"
  )
  $fileName = "$($p.id_menu)-$slug.jpg"
  $downloadPath = "C:\Users\MSI\Downloads\download gambar menu\$fileName"
  $publicPath = Join-Path $backendRoot "public\images\menu\$fileName"
  $downloaded = $false
  foreach ($u in $urls) {
    try {
      Invoke-WebRequest -Uri $u -OutFile $downloadPath -TimeoutSec 30
      $downloaded = $true
      break
    } catch {}
  }
  if (-not $downloaded) { throw "Gagal download gambar untuk $($p.nama_menu)" }
  Copy-Item -Force $downloadPath $publicPath
  $dbPath = "/images/menu/$fileName"
  $map += @{ id_menu = $p.id_menu; gambar = $dbPath }
}
$imageMap = Join-Path $PSScriptRoot "_tmp_image_map.json"
$updatePhp = Join-Path $PSScriptRoot "_tmp_update_images.php"
$map | ConvertTo-Json | Set-Content -Path $imageMap
& C:\xampp\php\php.exe $updatePhp $imageMap
