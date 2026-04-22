@echo off
title Cafe-X Monitor Center
color 0B

echo ==========================================
echo       CAFE-X STARTUP SYSTEM (LOCAL)
echo ==========================================

:: Start Laravel Backend
echo [1/6] Menjalankan Backend Laravel pada port 9000...
start "Laravel API" cmd /k "cd backend && C:\xampp\php\php.exe artisan serve --host=0.0.0.0 --port=9000"

:: Start Laravel Reverb (WebSockets)
echo [2/6] Menjalankan Laravel Reverb (WebSockets)...
start "Laravel Reverb" cmd /k "cd backend && C:\xampp\php\php.exe artisan reverb:start"

:: Start Admin HQ (Next.js)
echo [3/6] Menjalankan Enterprise HQ Dashboard pada port 3002...
start "HQ Dashboard" cmd /k "cd apps\admin-next && npm run dev -- --port 3002"

:: Start Landing Page & Customer QR (Next.js)
echo [4/6] Menjalankan Landing Page & Customer Portal pada port 3001...
start "Landing Page" cmd /k "cd apps\customer-next && npm run dev -- --port 3001"

:: Start Mobile POS Simulator (Expo Web)
echo [5/6] Menjalankan Mobile POS Simulator pada port 3003...
start "Mobile POS" cmd /k "cd apps\mobile-pos && npm run web -- --port 3003"

:: Start Queue Worker
echo [6/6] Menjalankan Laravel Queue Worker...
start "Laravel Queue" cmd /k "cd backend && C:\xampp\php\php.exe artisan queue:work --tries=3"

echo.
echo ==========================================
echo       CAFE-X ECOSYSTEM IS RUNNING
echo ==========================================
echo Backend API : http://localhost:9000
echo HQ Dashboard: http://localhost:3002
echo Landing Page: http://localhost:3001
echo Mobile POS  : http://localhost:3003
echo ==========================================
echo Tips: Akses Landing Page untuk simulasi alur pelanggan.
echo Tips: Akses Mobile POS untuk simulasi kasir offline.
pause
