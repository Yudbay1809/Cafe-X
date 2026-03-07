$items = @(
  @{ nama_menu='Espresso'; jenis_menu='coffee'; harga=28000 },
  @{ nama_menu='Americano'; jenis_menu='coffee'; harga=28000 },
  @{ nama_menu='Cappuccino'; jenis_menu='coffee'; harga=28000 },
  @{ nama_menu='Latte'; jenis_menu='coffee'; harga=28000 },
  @{ nama_menu='Flat White'; jenis_menu='coffee'; harga=30000 },
  @{ nama_menu='Mocha'; jenis_menu='coffee'; harga=30000 },
  @{ nama_menu='Caramel Latte'; jenis_menu='coffee'; harga=32000 },
  @{ nama_menu='Vanilla Latte'; jenis_menu='coffee'; harga=32000 },
  @{ nama_menu='Hazelnut Latte'; jenis_menu='coffee'; harga=32000 },
  @{ nama_menu='Cold Brew'; jenis_menu='coffee'; harga=30000 },

  @{ nama_menu='Matcha Latte'; jenis_menu='non coffee'; harga=25000 },
  @{ nama_menu='Chocolate'; jenis_menu='non coffee'; harga=22000 },
  @{ nama_menu='Taro Latte'; jenis_menu='non coffee'; harga=24000 },
  @{ nama_menu='Red Velvet'; jenis_menu='non coffee'; harga=24000 },
  @{ nama_menu='Lemon Tea'; jenis_menu='non coffee'; harga=20000 },
  @{ nama_menu='Lychee Tea'; jenis_menu='non coffee'; harga=22000 },
  @{ nama_menu='Honey Lemon'; jenis_menu='non coffee'; harga=22000 },
  @{ nama_menu='Thai Tea'; jenis_menu='non coffee'; harga=24000 },
  @{ nama_menu='Strawberry Milk'; jenis_menu='non coffee'; harga=23000 },
  @{ nama_menu='Sparkling Peach Tea'; jenis_menu='non coffee'; harga=24000 },

  @{ nama_menu='Nasi Goreng'; jenis_menu='main course'; harga=45000 },
  @{ nama_menu='Chicken Steak'; jenis_menu='main course'; harga=48000 },
  @{ nama_menu='Beef Steak'; jenis_menu='main course'; harga=52000 },
  @{ nama_menu='Spaghetti Bolognese'; jenis_menu='main course'; harga=45000 },
  @{ nama_menu='Spaghetti Aglio Olio'; jenis_menu='main course'; harga=42000 },
  @{ nama_menu='Chicken Katsu Curry'; jenis_menu='main course'; harga=48000 },
  @{ nama_menu='Beef Burger'; jenis_menu='main course'; harga=45000 },
  @{ nama_menu='Grilled Chicken Rice'; jenis_menu='main course'; harga=42000 },
  @{ nama_menu='Fish and Chips'; jenis_menu='main course'; harga=48000 },
  @{ nama_menu='Chicken Teriyaki'; jenis_menu='main course'; harga=45000 },

  @{ nama_menu='French Fries'; jenis_menu='appetizer'; harga=22000 },
  @{ nama_menu='Onion Rings'; jenis_menu='appetizer'; harga=22000 },
  @{ nama_menu='Spring Rolls'; jenis_menu='appetizer'; harga=24000 },
  @{ nama_menu='Chicken Wings'; jenis_menu='appetizer'; harga=28000 },
  @{ nama_menu='Garlic Bread'; jenis_menu='appetizer'; harga=20000 },
  @{ nama_menu='Nachos'; jenis_menu='appetizer'; harga=25000 },
  @{ nama_menu='Caesar Salad'; jenis_menu='appetizer'; harga=26000 },
  @{ nama_menu='Potato Wedges'; jenis_menu='appetizer'; harga=23000 },
  @{ nama_menu='Mozzarella Sticks'; jenis_menu='appetizer'; harga=28000 },
  @{ nama_menu='Soup of the Day'; jenis_menu='appetizer'; harga=20000 }
)

function Get-OpenverseResults($query) {
  $q = [uri]::EscapeDataString($query)
  $url = "https://api.openverse.engineering/v1/images/?q=$q&license=cc0,by,by-sa&format=json&page_size=20"
  $data = Invoke-RestMethod -Uri $url -TimeoutSec 60
  return $data.results
}

$backendRoot = Split-Path -Parent $PSScriptRoot
$downloadDir = "C:\Users\MSI\Downloads\download gambar menu"
$publicDir = Join-Path $backendRoot "public\images\menu"
New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null
New-Item -ItemType Directory -Force -Path $publicDir | Out-Null

$map = @()
$attributions = @()
$i = 0
foreach ($it in $items) {
  $name = ($it.nama_menu -replace '[^a-zA-Z0-9\s-]', '').Trim()
  $slug = ($name -replace '\s+', '-').ToLower()
  if ([string]::IsNullOrWhiteSpace($slug)) { $slug = "menu" }
  $fileName = "menu-$slug.jpg"
  $downloadPath = Join-Path $downloadDir $fileName
  $publicPath = Join-Path $publicDir $fileName

  if (-not (Test-Path $downloadPath) -or (Get-Item $downloadPath).Length -lt 1024) {
    $extra = @()
    if ($it.jenis_menu -eq 'coffee') { $extra += 'coffee' }
    if ($it.jenis_menu -eq 'non coffee') { $extra += 'tea' }
    if ($it.jenis_menu -eq 'main course') { $extra += 'main dish' }
    if ($it.jenis_menu -eq 'appetizer') { $extra += 'snack' }

    $queries = @(
      $it.nama_menu,
      "$($it.nama_menu) food",
      "$($it.nama_menu) drink"
    ) + $extra | Where-Object { $_ -and $_.Length -gt 0 }

    $results = @()
    foreach ($q in $queries) {
      $results = Get-OpenverseResults $q
      if ($results -and $results.Count -gt 0) { break }
    }

    if (-not $results -or $results.Count -eq 0) { throw "Gagal cari gambar untuk $($it.nama_menu)" }
    $idx = $i % $results.Count
    $pick = $results[$idx]
    Invoke-WebRequest -Uri $pick.url -OutFile $downloadPath -TimeoutSec 60
    Start-Sleep -Milliseconds 400
    $attributions += [pscustomobject]@{
      menu = $it.nama_menu
      image_url = $pick.url
      creator = $pick.creator
      license = $pick.license
      license_url = $pick.license_url
      source = $pick.source
      landing_url = $pick.foreign_landing_url
      attribution = $pick.attribution
    }
  }

  Copy-Item -Force $downloadPath $publicPath
  $dbPath = "/images/menu/$fileName"
  $map += @{ id_menu = $null; nama_menu = $it.nama_menu; jenis_menu = $it.jenis_menu; stok = 99; harga = $it.harga; gambar = $dbPath }
  $i++
}

$itemsJson = Join-Path $PSScriptRoot "_tmp_menu_items.json"
$upsertPhp = Join-Path $PSScriptRoot "_tmp_upsert_menu.php"
$map | ConvertTo-Json -Depth 3 | Set-Content -Path $itemsJson
$attributions | Export-Csv -NoTypeInformation -Path "$downloadDir\attribution.csv"
C:\xampp\php\php.exe $upsertPhp $itemsJson
