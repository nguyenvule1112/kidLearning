@echo off
chcp 65001 >nul
REM Nhấp đúp để chạy "Bé Học Vui" cho cả mạng LAN (iPad / điện thoại cùng Wi-Fi)
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Thử mở cổng tường lửa LAN (nếu đang chạy quyền Admin)
netsh advfirewall firewall set rule name="Node.js JavaScript Runtime" new profile=any >nul 2>&1
netsh advfirewall firewall add rule name="Be Hoc Vui LAN (5173,4173)" dir=in action=allow protocol=TCP localport=5173,4173 profile=any >nul 2>&1

call npm install --no-audit --no-fund
start "" http://localhost:4173
call npm start
pause
