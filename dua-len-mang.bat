@echo off
chcp 65001 >nul
REM Nhấp đúp để cập nhật bản online lên GitHub Pages (cần làm bước "Lần đầu" trong README trước)
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
where git >nul 2>&1 || (echo Chua cai Git. Tai tai https://git-scm.com/download/win & pause & exit /b)
call npm install --no-audit --no-fund
call npm run deploy
echo.
echo Xong! Doi 1-2 phut roi mo link https://TEN-GITHUB.github.io/be-hoc-vui/
pause
