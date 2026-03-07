<?php
$pdo=new PDO("mysql:host=127.0.0.1;port=3306;dbname=dbpemesanan;charset=utf8mb4","root","");
$items = json_decode(file_get_contents($argv[1] ?? ''), true);
if (!is_array($items)) { exit("invalid items"); }
$tenantId = (int) ($pdo->query("SELECT id FROM tenants ORDER BY id LIMIT 1")->fetchColumn() ?: 1);
$now = date('Y-m-d H:i:s');
foreach ($items as $it) {
  $stmt = $pdo->prepare("SELECT id_menu FROM produk WHERE nama_menu = ? LIMIT 1");
  $stmt->execute([$it['nama_menu']]);
  $existingId = $stmt->fetchColumn();
  if ($existingId) {
    $upd = $pdo->prepare("UPDATE produk SET tenant_id=?, jenis_menu=?, stok=?, harga=?, gambar=?, is_active=1, updated_at=? WHERE id_menu=?");
    $upd->execute([$tenantId, $it['jenis_menu'], $it['stok'], $it['harga'], $it['gambar'], $now, $existingId]);
  } else {
    $ins = $pdo->prepare("INSERT INTO produk (tenant_id,nama_menu,jenis_menu,stok,harga,gambar,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?)");
    $ins->execute([$tenantId, $it['nama_menu'], $it['jenis_menu'], $it['stok'], $it['harga'], $it['gambar'], $now, $now]);
  }
}
