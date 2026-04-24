# Cafe-X Enterprise HQ ☕
> **The Sultan OLED Dark Expansion**

Sistem monorepo profesional untuk Cafe-X yang mengintegrasikan ekosistem backend Laravel dengan tiga aplikasi mutakhir (Admin, Customer, & POS) dalam satu desain bahasa yang seragam: **Sultan Executive Gold & OLED Dark**.

---

## 🏛️ Arsitektur Ekosistem

| Module | Technology | Port | Description |
| :--- | :--- | :--- | :--- |
| **Backend** | Laravel 11 | `9000` | Core API & Global Sync Matrix |
| **Admin-Next** | Next.js 14 | `3002` | Enterprise Command Center (Sultan UI) |
| **Customer-Next** | Next.js 14 | `3001` | Self-Service Kiosk & Menu (Cinematic UI) |
| **Mobile-POS** | Expo (React Native) | - | Hybrid POS Terminal (SQLite Offline First) |

---

## ✨ Design System: Sultan OLED Dark
Ekosistem ini menggunakan sistem desain **Sultan Executive** yang dioptimalkan untuk layar OLED:
- **Primary Palette**: Deep Terracotta (`#632C0D`) & Executive Gold (`#FBBF24`).
- **Typography**: `Playfair Display SC` (Headings) & `Karla` (Body).
- **Aesthetics**: Glassmorphism, Cinematic Motion (`framer-motion`), dan Mobile-First Responsiveness.

---

## 🚀 Instalasi & Menjalankan

### 1. Backend (Laravel API)
```powershell
cd backend
php artisan serve --port=9000
```

### 2. Admin Command Center (Next.js)
```powershell
cd apps/admin-next
npm install
npm run dev -- --port 3002
```

### 3. Customer Kiosk (Next.js)
```powershell
cd apps/customer-next
npm install
npm run dev -- --port 3001
```

### 4. POS Terminal (Mobile/Tablet)
```powershell
cd apps/mobile-pos
npm install
npx expo start
```

---

## 🛡️ Fitur Unggulan v3.0
- **AI Forecasting**: Prediksi stok dan inventory berdasarkan tren penjualan historical.
- **Offline-First POS**: Sinkronisasi database lokal SQLite ke cloud secara otomatis.
- **Multi-Brand HQ**: Kelola beberapa brand outlet dalam satu dashboard terpadu.
- **Cinematic Kiosk**: Transisi menu yang mulus dengan visual premium untuk pengalaman pelanggan.
- **Enterprise Security**: Audit logs real-time dan sistem otentikasi berlapis.

---

## 📝 Catatan Penting
- **API Origin**: Pastikan backend berjalan di port `9000`.
- **Database**: Gunakan MySQL untuk backend dan SQLite (via expo-sqlite) untuk mobile-pos.
- **Git LFS**: Digunakan untuk mengelola aset desain resolusi tinggi.

---
*Developed with Passion for the Coffee Industry by Cafe-X Enterprise Team.*
