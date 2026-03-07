<?php
$pdo=new PDO("mysql:host=127.0.0.1;port=3306;dbname=dbpemesanan;charset=utf8mb4","root","");
$rows=$pdo->query("SELECT id_menu,nama_menu,jenis_menu FROM produk ORDER BY id_menu")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_UNESCAPED_UNICODE);
