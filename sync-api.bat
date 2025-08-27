@echo off
echo 🔄 Syncing API files for Vercel deployment...
echo.

echo 📁 Copying files from server\api to api...
copy "server\api\*.ts" "api\" >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ API files synced successfully!
    echo.
    echo 📋 Files in api directory:
    dir api\*.ts /b
) else (
    echo ❌ Failed to sync API files
    echo.
    echo 🔍 Checking if directories exist...
    if exist "server\api" (
        echo ✅ server\api directory exists
    ) else (
        echo ❌ server\api directory not found
    )
    if exist "api" (
        echo ✅ api directory exists
    ) else (
        echo ❌ api directory not found
    )
)

echo.
echo 🚀 Ready for Vercel deployment!
echo 💡 Run: vercel --prod
echo.
pause
