@echo off
setlocal enabledelayedexpansion
REM eTracking Email Utility - GUI Launcher
REM This script starts the GUI server on localhost:3000

color 0A
title eTracking Email Utility - GUI Server
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║      eTracking Email Utility - GUI Server Launcher         ║
echo ║                                                            ║
echo ║  Starting web interface at http://localhost:3000           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo Node.js is required to run this application.
    echo Please download and install from: https://nodejs.org/
    echo.
    echo After installing Node.js, run this script again.
    echo.
    pause
    exit /b 1
)

REM Get Node version
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check if npm dependencies are installed
if not exist "node_modules" (
    color 0E
    echo.
    echo 📦 Installing npm dependencies... (this may take a minute)
    echo.
    call npm install >nul 2>&1
    if !errorlevel! neq 0 (
        color 0C
        echo ❌ Failed to install dependencies
        echo Please try running: npm install
        pause
        exit /b 1
    )
    color 0A
    echo ✅ Dependencies installed successfully
)

REM Check if .env file exists
if not exist ".env" (
    color 0E
    echo.
    echo ⚠️  WARNING: .env file not found!
    echo.
    echo Your email configuration is missing. The server will start but
    echo you won't be able to send emails until you configure it.
    echo.
    echo Steps to fix:
    echo 1. Open .env file (create if doesn't exist)
    echo 2. Add your email credentials:
    echo.
    echo    EMAIL_SERVICE=smtp
    echo    SMTP_HOST=smtp.zeptomail.com
    echo    SMTP_PORT=587
    echo    EMAIL_USER=your-email@example.com
    echo    EMAIL_PASS=your-app-password
    echo    FROM_NAME=Your Company
    echo    FROM_EMAIL=your-email@example.com
    echo.
    echo 3. Save and restart this script
    echo.
    timeout /t 5 /nobreak
    color 0A
) else (
    echo ✅ Configuration file found
)

REM Kill any existing Node processes on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 "') do taskkill /pid %%a /f >nul 2>&1

echo.
echo 🚀 Starting server...
echo.

REM Wait a moment and open browser
timeout /t 2 /nobreak >nul

color 0B
echo ✅ Server starting...
echo.
echo 🌐 Opening browser at http://localhost:3000...
echo.

REM Open the GUI in the default browser
start http://localhost:3000

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║  ✅ Server is running at: http://localhost:3000           ║
echo ║                                                            ║
echo ║  📧 Steps to send emails:                                 ║
echo ║     1. Upload your CSV file (with email-template column)  ║
echo ║     2. Preview the email                                  ║
echo ║     3. Choose Dry Run or Send                             ║
echo ║                                                            ║
echo ║  ⚠️  Press Ctrl+C to stop the server                       ║
echo ║                                                            ║
echo ║  📝 CSV Format:                                           ║
echo ║     email, customerName, email-template, [other columns]  ║
echo ║                                                            ║
echo ║  Example:                                                  ║
echo ║     test@example.com, John Doe, renewal-pending           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Server is running. Press Ctrl+C in this window to stop.
echo.

REM Start the server
call npm run gui

REM Server stopped
color 0C
echo.
echo Server stopped.
echo.
pause
