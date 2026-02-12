#!/usr/bin/env powershell

# eTracking Email Utility - GUI Launcher (PowerShell version)
# Run with: powershell -ExecutionPolicy Bypass -File start-gui.ps1

$ErrorActionPreference = "Continue"

# Set window title
$host.ui.RawUI.WindowTitle = "eTracking Email Utility - GUI Server"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      eTracking Email Utility - GUI Server Launcher         ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  Starting web interface at http://localhost:3000           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Node.js is required to run this application." -ForegroundColor Yellow
    Write-Host "Please download and install from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installing Node.js, run this script again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Installing npm dependencies... (this may take a minute)" -ForegroundColor Yellow
    Write-Host ""
    & npm install 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Write-Host "Please try running: npm install" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚠️  WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your email configuration is missing. The server will start but" -ForegroundColor Yellow
    Write-Host "you won't be able to send emails until you configure it." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps to fix:" -ForegroundColor Yellow
    Write-Host "1. Create a .env file in the project root" -ForegroundColor Yellow
    Write-Host "2. Add your email credentials:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   EMAIL_SERVICE=smtp" -ForegroundColor Cyan
    Write-Host "   SMTP_HOST=smtp.zeptomail.com" -ForegroundColor Cyan
    Write-Host "   SMTP_PORT=587" -ForegroundColor Cyan
    Write-Host "   EMAIL_USER=your-email@example.com" -ForegroundColor Cyan
    Write-Host "   EMAIL_PASS=your-app-password" -ForegroundColor Cyan
    Write-Host "   FROM_NAME=Your Company" -ForegroundColor Cyan
    Write-Host "   FROM_EMAIL=your-email@example.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Save and restart this script" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 5
} else {
    Write-Host "✅ Configuration file found" -ForegroundColor Green
}

# Kill any existing Node processes on port 3000
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🚀 Starting server..." -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 1

Write-Host "✅ Server starting..." -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
Write-Host ""

# Open the GUI in the default browser
Start-Process "http://localhost:3000"
Start-Sleep -Seconds 2

# Display instructions
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  ✅ Server is running at: http://localhost:3000           ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  📧 Steps to send emails:                                 ║" -ForegroundColor Green
Write-Host "║     1. Upload your CSV file (with email-template column)  ║" -ForegroundColor Green
Write-Host "║     2. Preview the email                                  ║" -ForegroundColor Green
Write-Host "║     3. Choose Dry Run or Send                             ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  ⚠️  Press Ctrl+C to stop the server                       ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  📝 CSV Format:                                           ║" -ForegroundColor Green
Write-Host "║     email, customerName, email-template, [other columns]  ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  Example:                                                  ║" -ForegroundColor Green
Write-Host "║     test@example.com, John Doe, renewal-pending           ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Server is running. Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

# Start the server process
& npm run gui
