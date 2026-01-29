@echo off
echo ==========================================
echo   ReignScore Home Office Restore Script
echo ==========================================
echo.

echo [1/4] Pulling latest changes from GitHub...
git pull
if %errorlevel% neq 0 (
    echo Error: Failed to pull from GitHub.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Installing Root Dependencies...
call npm install

echo.
echo [3/4] Installing Server Dependencies...
cd server
call npm install
cd ..

echo.
echo [4/4] Setup Complete! 
echo.
echo to start the app, run:
echo    npx expo start --tunnel
echo.
echo In a separate terminal, start the server:
echo    cd server ^&^& npm start
echo.
pause
