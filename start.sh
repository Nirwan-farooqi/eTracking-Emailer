#!/bin/bash

# eTracking Email Utility - Quick Start Script
# This script provides one-command setup and execution

echo "🚀 eTracking Email Utility - Quick Start"
echo "========================================"

# Make scripts executable
chmod +x setup.sh
chmod +x run.sh

# Check if this is first time setup
if [ ! -d "node_modules" ] || [ ! -f ".env" ]; then
    echo "🔧 First time setup detected. Running initial setup..."
    ./setup.sh
    
    if [ $? -ne 0 ]; then
        echo "❌ Setup failed. Please check error messages above."
        exit 1
    fi
    
    echo ""
    echo "✅ Setup completed!"
    echo ""
    echo "📝 IMPORTANT: Please update your .env file with:"
    echo "   - Your SMTP password (SMTP_PASS)"
    echo "   - Add payment QR code image to images/payment-options.jpeg"
    echo "   - Place CSV files in customers/ directory"
    echo ""
    echo "🎯 Then run: ./run.sh process"
    
else
    echo "✅ Environment already set up."
    echo ""
    echo "📋 Quick Actions:"
    echo "1. ./run.sh test      - Test with 1 customer"
    echo "2. ./run.sh dry-run   - Test without sending emails"
    echo "3. ./run.sh process   - Send emails to all customers"
    echo "4. ./run.sh help      - Show detailed help"
    echo ""
    
    # Check for CSV files
    CSV_COUNT=$(find customers -name "*.csv" 2>/dev/null | wc -l)
    if [ "$CSV_COUNT" -eq 0 ]; then
        echo "⚠️  No CSV files found in customers/ directory."
        echo "   Please add your customer CSV files first."
    else
        echo "✅ Found $CSV_COUNT CSV file(s) ready for processing."
        echo ""
        echo "🚀 Start processing? Choose an option:"
        echo "   t) Test mode (1 customer)"
        echo "   d) Dry run (no emails sent)"
        echo "   p) Process all (send emails)"
        echo "   q) Quit"
        echo ""
        read -p "Enter your choice [t/d/p/q]: " choice
        
        case $choice in
            t|T)
                echo "🧪 Running test mode..."
                ./run.sh test
                ;;
            d|D)
                echo "🧪 Running dry run..."
                ./run.sh dry-run
                ;;
            p|P)
                echo "📧 Processing all customers..."
                ./run.sh process
                ;;
            q|Q)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid choice. Use ./run.sh help for more options."
                exit 1
                ;;
        esac
    fi
fi
