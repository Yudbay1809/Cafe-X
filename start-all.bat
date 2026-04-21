@echo off
title Cafe-X Monitor Center
color 0B

echo ==========================================
echo       CAFE-X STARTUP SYSTEM (LOCAL)
echo ==========================================

:: Start Laravel Backend
echo [1/4] Menjalankan Backend Laravel pada port 9000...
start "Laravel API" cmd /k "cd backend && C:\xampp\php\php.exe artisan serve --host=0.0.0.0 --port=9000"

:: Start Laravel Reverb (WebSockets)
echo [2/4] Menjalankan Laravel Reverb (WebSockets)...
start "Laravel Reverb" cmd /k "cd backend && C:\xampp\php\php.exe artisan reverb:start"

:: Start Admin Next.js
echo [3/4] Menjalankan Admin Next.js pada port 3002...
start "Admin Web" cmd /k "cd apps\admin-next && npm run dev -- --port 3002"

:: Start Customer Next.js
echo [4/5] Menjalankan Customer Next.js pada port 3001...
start "Customer Web" cmd /k "cd apps\customer-next && npm run dev -- --port 3001"

:: Start Queue Worker
echo [5/5] Menjalankan Laravel Queue Worker...
start "Laravel Queue" cmd /k "cd backend && C:\xampp\php\php.exe artisan queue:work --tries=3"

echo.
echo ==========================================
echo SEMUA LAYANAN SEDANG BERJALAN!
echo Backend: http://localhost:9000
echo Admin: http://localhost:3002
echo Customer: http://localhost:3001
echo ==========================================
echo Gunakan IP Lokal (misal 192.168.1.x:9000) untuk akses dari perangkat lain.
pause
