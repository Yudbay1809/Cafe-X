# Cafe-X Monorepo

Struktur profesional untuk Cafe-X: backend Laravel + 3 aplikasi (admin, customer, POS) dalam satu repo.

## Struktur
```
backend/           Laravel API
apps/
  admin-next/      Admin web (Next.js)
  customer-next/   Customer web (Next.js)
  pos-flutter/     POS desktop/tablet (Flutter)
docs/              Dokumentasi operasional
postman/           Koleksi Postman
```

## Jalankan Backend (Laravel)
```
cd backend
C:\xampp\php\php.exe artisan serve --host=127.0.0.1 --port=9000
```

## Jalankan Admin Web
```
cd apps/admin-next
npm install
npm run dev -- --port 3002
```

## Jalankan Customer Web
```
cd apps/customer-next
npm install
npm run dev -- --port 3001
```

## Jalankan POS (Flutter)
```
cd apps/pos-flutter
flutter run -d windows
```

## Catatan
- Semua app memakai API base `http://127.0.0.1:9000/api/v1`.
- Jika backend pindah port, update `.env` masing‑masing app.
