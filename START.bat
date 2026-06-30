@echo off
echo Starting AfriFX Academy...
echo.
echo [HOMEPAGE] Syncing marketing homepage...
if exist "C:\Users\Admin\Desktop\Afrix life\index.html" (
  copy /Y "C:\Users\Admin\Desktop\Afrix life\index.html" "%~dp0client\public\welcome.html" >nul
  echo   Homepage synced from Afrix life\index.html
) else (
  echo   Source HTML not found - using existing welcome.html
)
echo.
echo [SERVER] Starting API on http://localhost:5000
start "AfriFX API" cmd /k "cd /d "%~dp0server" && node src/index.js"
timeout /t 2 /nobreak >nul
echo [CLIENT] Starting React app on http://localhost:5173
start "AfriFX Client" cmd /k "cd /d "%~dp0client" && npm run dev"
echo.
echo ========================================
echo  AfriFX Academy is starting up!
echo  Public site : http://localhost:5173        ^(HTML homepage^)
echo  Courses     : http://localhost:5173/courses
echo  Admin login : http://localhost:5173/admin/login
echo  Admin creds : admin@afrifx.com / admin123
echo ========================================
