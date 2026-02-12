#!/bin/bash

# eTracking Email Utility - Setup Script
# This script installs all required dependencies and sets up the environment

echo "🚀 Setting up eTracking Email Utility..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v14 or higher) and try again."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "================================"

if npm install; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Please check the error messages above."
    exit 1
fi

# Create necessary directories
echo ""
echo "📁 Creating required directories..."
echo "=================================="

mkdir -p customers
mkdir -p logs
mkdir -p output

echo "✅ Directory structure created:"
echo "   - customers/ (place your CSV files here)"
echo "   - logs/ (application logs will be stored here)"
echo "   - output/ (processed data and reports)"

# Check if .env file exists
echo ""
echo "⚙️  Environment Configuration..."
echo "==============================="

if [ ! -f ".env" ]; then
    echo "📝 Creating .env template file..."
    cat > .env << EOF
# SMTP Configuration for Zoho Mail
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@etracking.pk
SMTP_PASS=your_password_here

# Email Configuration
FROM_EMAIL=support@etracking.pk
FROM_NAME=eTracking Support Team
CC_EMAIL=team@etracking.pk

# Application Configuration
BATCH_SIZE=50
BATCH_DELAY=2000
DRY_RUN=false

# Debug Configuration
DEBUG=false
LOG_LEVEL=info
EOF
    echo "✅ .env template created. Please update with your actual credentials."
    echo "⚠️  IMPORTANT: Update SMTP_PASS with your actual password!"
else
    echo "✅ .env file already exists."
fi

# Check if payment image exists
echo ""
echo "🖼️  Checking for payment options image..."
echo "========================================"

if [ ! -f "images/payment-options.jpeg" ]; then
    echo "⚠️  Payment options image not found at: images/payment-options.jpeg"
    echo "   Please add your payment QR code image to the images/ directory"
    mkdir -p images
else
    echo "✅ Payment options image found."
fi

# Setup completion
echo ""
echo "🎉 Setup completed successfully!"
echo "==============================="
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your SMTP credentials"
echo "2. Add your payment QR code image to images/payment-options.jpeg"
echo "3. Place your CSV files in the customers/ directory"
echo "4. Run './run.sh' to start processing emails"
echo ""
echo "📖 Available commands:"
echo "   ./run.sh process        - Process CSV files and send emails"
echo "   ./run.sh dry-run        - Test run without sending emails"
echo "   ./run.sh test           - Process only 1 customer (test mode)"
echo "   ./run.sh help           - Show help information"
echo ""
echo "✨ Happy emailing!"
