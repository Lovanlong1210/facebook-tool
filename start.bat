@echo off
title Facebook Tool - Startup Script
color 0A

echo ============================================
echo   FACEBOOK TOOL - KHOI DONG HE THONG
echo ============================================
echo.

:: Buoc 1: Khoi dong Redis qua Docker
echo [1/4] Dang khoi dong Redis (Docker)...
docker compose -f "d:\facebook_Tool\docker-compose.yml" up -d redis
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Khoi dong Redis that bai! Kiem tra Docker Desktop.
    pause
    exit /b 1
)
echo [OK] Redis dang chay tren port 6379

:: Cho Redis san sang
echo Cho Redis san sang (5 giay)...
timeout /t 5 /nobreak > nul

:: Buoc 2: Khoi dong tat ca PM2 apps
echo.
echo [2/4] Dang khoi dong Backend + Workers + Frontend bang PM2...
cd /d "d:\facebook_Tool"
pm2 start ecosystem.config.js
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] PM2 khoi dong that bai!
    pause
    exit /b 1
)

:: Buoc 3: Hien thi trang thai
echo.
echo [3/4] Trang thai cac tien trinh:
pm2 list

:: Buoc 4: Luu PM2 list de tu dong chay khi restart
echo.
echo [4/4] Luu cau hinh PM2...
pm2 save

echo.
echo ============================================
echo   HE THONG DA KHOI DONG THANH CONG!
echo ============================================
echo   Backend API : http://localhost:5000
echo   Frontend    : http://localhost:3000
echo   Redis       : localhost:6379
echo ============================================
echo.
echo Nhan phim bat ky de dong cua so nay...
pause > nul
