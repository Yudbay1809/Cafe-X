<?php
$pdo=new PDO("mysql:host=127.0.0.1;port=3306;dbname=dbpemesanan;charset=utf8mb4","root","");
$map = json_decode(file_get_contents($argv[1] ?? ''), true);
if (!is_array($map)) { exit("invalid map"); }
$stmt = $pdo->prepare("UPDATE produk SET gambar = ? WHERE id_menu = ?");
foreach ($map as $row) {
  $stmt->execute([$row['gambar'], $row['id_menu']]);
}
