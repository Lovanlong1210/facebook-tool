@echo off
title Facebook Tool - Stop Script
color 0C

echo ============================================
echo   FACEBOOK TOOL - DUNG HE THONG
echo ============================================
echo.

echo [1/2] Dung tat ca PM2 processes...
pm2 stop all
pm2 delete all

echo.
echo [2/2] Dung Redis Docker container...
docker compose -f "d:\facebook_Tool\docker-compose.yml" down

echo.
echo ============================================
echo   HE THONG DA DUNG HOAN TOAN!
echo ============================================
pause > nul
