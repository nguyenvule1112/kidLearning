@echo off
chcp 65001 >nul
REM Tự động xin quyền Administrator để mở tường lửa Windows cho iPad/điện thoại truy cập qua Wi-Fi
net session >nul 2>&1
if %errorLevel% neq 0 (
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit /b
)
netsh advfirewall firewall set rule name="Node.js JavaScript Runtime" new profile=any
netsh advfirewall firewall add rule name="Be Hoc Vui LAN (5173,4173)" dir=in action=allow protocol=TCP localport=5173,4173 profile=any
echo.
echo ========================================================
echo Da mo tuong lua LAN thanh cong cho iPad / Dien thoai!
echo ========================================================
pause
