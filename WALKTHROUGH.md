# Cafe-X Enterprise V1.0: Panduan Lengkap & Walkthrough

Selamat! Cafe-X kini telah berevolusi menjadi sistem Enterprise V1.0 yang lengkap. Dokumen ini merangkum seluruh fitur utama yang telah diimplementasikan dari Fase 1 hingga Fase 11.

## 1. Ekosistem Pemesanan & Kasir (POS)
- **POS Modern**: Antarmuka kasir yang cepat dengan dukungan kategori produk dan pencarian.
- **QR Table Ordering**: Pelanggan dapat memesan langsung dari meja menggunakan QR code tanpa perlu download aplikasi.
- **Kitchen Display System (KDS)**: Manajemen pesanan di dapur untuk memantau durasi persiapan.

## 2. Manajemen Stok & Produksi (Inventory)
- **Ingredients Management**: Pelacakan stok bahan baku (biji kopi, susu, sirup, dll).
- **Recipe System (BOM)**: Otomatisasi pemotongan stok bahan baku setiap kali menu terjual.
- **Waste Tracking**: Pencatatan barang rusak atau kadaluwarsa.

## 3. Pengadaan & Supplier (Procurement)
- **Supplier Directory**: Kelola database vendor mitra.
- **Purchase Order (PO)**: Digitalisasi pemesanan barang ke supplier.
- **Goods Receipt (GR)**: Penerimaan barang yang otomatis memperbarui level stok gudang.

## 4. Loyalitas Pelanggan (Loyalty System)
- **Membership**: Registrasi member menggunakan nomor WhatsApp.
- **Point Earning**: Akumulasi poin otomatis (Rp 1.000 = 1 Poin).
- **Point Redemption**: Member bisa menukarkan poin menjadi diskon langsung di dalam keranjang belanja.

## 5. Pelaporan & Wawasan Bisnis (Analytics)
- **Financial Reports**: Laporan penjualan, pajak, dan diskon yang mendalam.
- **HQ Insights**: Dasbor pusat untuk Owner untuk memantau performa lintas cabang (Multi-Outlet).
- **Audit Logs**: Rekaman aktivitas sistem untuk keamanan dan transparansi.

## 6. Otomasi & Notifikasi
- **WhatsApp Ready Notification**: Notifikasi otomatis ke pelanggan saat pesanan siap diambil.
- **Daily Financial Email/WA**: Laporan ringkasan harian otomatis yang dikirimkan ke Owner setiap jam 23:59.

---

## Panduan Teknis Singkat

### Menjalankan Sistem
Gunakan file `start-all.bat` di root direktori untuk menjalankan Backend, Admin UI, dan Customer UI secara bersamaan.

### Konfigurasi Penting (.env)
Pastikan parameter berikut sudah dikonfigurasi di file `backend/.env`:
- `OWNER_WHATSAPP`: Nomor WA Owner untuk menerima laporan.
- `FONNTE_TOKEN` (Opsional): Token API untuk pengiriman WA asli.
- `MAIL_HOST` / `MAIL_PASSWORD`: Untuk pengiriman laporan via Email.

### Scheduler
Sistem menggunakan Laravel Scheduler. Jalankan perintah berikut di server produksi:
```bash
php artisan schedule:run
```

---

# Cafe-X Enterprise V2.0: Offline-First Mobile POS

Sistem kini telah berekspansi menjadi V2.0 dengan pemisahan Kasir dari Web Admin menjadi aplikasi **Mobile/Tablet POS** mandiri.

## 1. Arsitektur Cloud & Mobile
- **HQ Web Dashboard (`admin-next`)**: Fokus murni sebagai pusat kendali untuk mengelola Multi-Outlet, Master Menu, Global Inventory, dan memantau status tablet kasir dari jarak jauh.
- **Mobile POS (`mobile-pos`)**: Aplikasi Tablet (berbasis React Native/Expo) yang ter-install di kafe. Menggunakan **SQLite Lokal**, sehingga kasir tetap bisa beroperasi 100% secara offline walau koneksi internet terputus.

## 2. Fitur Unggulan Mobile POS
- **Offline-First Checkout**: Saat offline, transaksi otomatis tertampung di Local DB (Queue System).
- **Auto-Sync Engine**: Terdapat *engine* di *background* yang akan langsung menembak (*bulk sync*) seluruh riwayat transaksi offline ke Cloud Backend begitu sinyal internet kembali menyala.
- **Conflict Resolution Anti-Duplikasi**: API Backend memastikan Order ID unik, sehingga tidak akan ada data ganda meski terjadi putus-sambung koneksi.
- **Simulasi Thermal Printer & Cash Drawer**: Terintegrasi *hardware module* yang mencetak struk secara otomatis saat *checkout*, serta membuka laci kasir (Cash Drawer).
- **Shift Management**: Mode keamanan di mana sistem terkunci jika kasir belum melakukan "Open Shift", dan terdapat fitur "Close Shift" untuk rekap akhir hari.

---
*Dokumen ini dibuat otomatis sebagai bagian dari dokumentasi serah terima Cafe-X Enterprise V1.0 & V2.0.*
