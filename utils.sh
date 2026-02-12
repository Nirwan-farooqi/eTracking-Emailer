#!/bin/bash

# eTracking Email Utility - Utility Script
# This script provides maintenance and utility functions

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_help() {
    echo -e "${BLUE}eTracking Email Utility - Utility Functions${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
    echo "Usage: ./utils.sh [command]"
    echo ""
    echo -e "${GREEN}Available Commands:${NC}"
    echo "  status      - Check system status and configuration"
    echo "  clean       - Clean logs and temporary files"
    echo "  backup      - Backup configuration and data"
    echo "  restore     - Restore from backup"
    echo "  logs        - View recent logs"
    echo "  test-smtp   - Test SMTP connection"
    echo "  update      - Update dependencies"
    echo "  help        - Show this help message"
    echo ""
}

check_status() {
    echo -e "${BLUE}📊 System Status Check${NC}"
    echo -e "${BLUE}=====================${NC}"
    echo ""
    
    # Node.js version
    if command -v node &> /dev/null; then
        echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
    else
        echo -e "${RED}❌ Node.js: Not installed${NC}"
    fi
    
    # npm version
    if command -v npm &> /dev/null; then
        echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
    else
        echo -e "${RED}❌ npm: Not installed${NC}"
    fi
    
    # Dependencies
    if [ -d "node_modules" ]; then
        DEP_COUNT=$(ls node_modules | wc -l)
        echo -e "${GREEN}✅ Dependencies: $DEP_COUNT packages installed${NC}"
    else
        echo -e "${RED}❌ Dependencies: Not installed${NC}"
    fi
    
    # Configuration
    if [ -f ".env" ]; then
        echo -e "${GREEN}✅ Configuration: .env file exists${NC}"
        
        # Check if SMTP password is set
        if grep -q "SMTP_PASS=your_password_here" .env; then
            echo -e "${YELLOW}⚠️  SMTP Password: Still using default (needs update)${NC}"
        else
            echo -e "${GREEN}✅ SMTP Password: Configured${NC}"
        fi
    else
        echo -e "${RED}❌ Configuration: .env file missing${NC}"
    fi
    
    # CSV files
    if [ -d "customers" ]; then
        CSV_COUNT=$(find customers -name "*.csv" | wc -l)
        if [ "$CSV_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✅ CSV Files: $CSV_COUNT file(s) found${NC}"
        else
            echo -e "${YELLOW}⚠️  CSV Files: No files in customers/ directory${NC}"
        fi
    else
        echo -e "${RED}❌ CSV Directory: customers/ not found${NC}"
    fi
    
    # Payment image
    if [ -f "images/payment-options.jpeg" ]; then
        IMAGE_SIZE=$(ls -lh images/payment-options.jpeg | awk '{print $5}')
        echo -e "${GREEN}✅ Payment Image: Found ($IMAGE_SIZE)${NC}"
    else
        echo -e "${YELLOW}⚠️  Payment Image: Not found at images/payment-options.jpeg${NC}"
    fi
    
    # Logs
    if [ -d "logs" ]; then
        LOG_COUNT=$(find logs -name "*.log" 2>/dev/null | wc -l)
        echo -e "${GREEN}✅ Logs: $LOG_COUNT log file(s)${NC}"
    else
        echo -e "${YELLOW}⚠️  Logs: Directory not found${NC}"
    fi
}

clean_files() {
    echo -e "${BLUE}🧹 Cleaning temporary files and logs...${NC}"
    
    # Clean old logs (keep last 10)
    if [ -d "logs" ]; then
        LOG_COUNT=$(find logs -name "*.log" | wc -l)
        if [ "$LOG_COUNT" -gt 10 ]; then
            echo "📄 Cleaning old log files..."
            find logs -name "*.log" -type f -printf '%T@ %p\n' | sort -n | head -n -10 | cut -d' ' -f2- | xargs rm -f
            echo -e "${GREEN}✅ Old logs cleaned${NC}"
        else
            echo -e "${GREEN}✅ Log files are within limit${NC}"
        fi
    fi
    
    # Clean npm cache
    echo "📦 Cleaning npm cache..."
    npm cache clean --force > /dev/null 2>&1
    echo -e "${GREEN}✅ npm cache cleaned${NC}"
    
    # Clean output directory if exists
    if [ -d "output" ]; then
        echo "📂 Cleaning output directory..."
        rm -rf output/*
        echo -e "${GREEN}✅ Output directory cleaned${NC}"
    fi
    
    echo -e "${GREEN}🎉 Cleanup completed!${NC}"
}

backup_data() {
    echo -e "${BLUE}💾 Creating backup...${NC}"
    
    BACKUP_DIR="backups"
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup configuration
    if [ -f ".env" ]; then
        cp .env "$BACKUP_PATH/"
        echo "✅ Configuration backed up"
    fi
    
    # Backup customers data
    if [ -d "customers" ]; then
        cp -r customers "$BACKUP_PATH/"
        echo "✅ Customer data backed up"
    fi
    
    # Backup images
    if [ -d "images" ]; then
        cp -r images "$BACKUP_PATH/"
        echo "✅ Images backed up"
    fi
    
    # Backup templates
    if [ -d "templates" ]; then
        cp -r templates "$BACKUP_PATH/"
        echo "✅ Templates backed up"
    fi
    
    # Create backup info
    cat > "$BACKUP_PATH/backup_info.txt" << EOF
Backup created: $(date)
System: $(uname -a)
Node.js: $(node --version)
npm: $(npm --version)
Backup contents:
$(ls -la "$BACKUP_PATH/")
EOF
    
    echo -e "${GREEN}🎉 Backup created: $BACKUP_PATH${NC}"
}

view_logs() {
    echo -e "${BLUE}📋 Recent Logs${NC}"
    echo -e "${BLUE}=============${NC}"
    
    if [ -d "logs" ]; then
        LATEST_LOG=$(find logs -name "*.log" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
        
        if [ -n "$LATEST_LOG" ]; then
            echo "📄 Latest log file: $LATEST_LOG"
            echo ""
            tail -50 "$LATEST_LOG"
        else
            echo -e "${YELLOW}⚠️  No log files found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Logs directory not found${NC}"
    fi
}

test_smtp() {
    echo -e "${BLUE}📧 Testing SMTP Connection...${NC}"
    echo -e "${BLUE}===========================${NC}"
    
    if [ ! -f ".env" ]; then
        echo -e "${RED}❌ .env file not found${NC}"
        return 1
    fi
    
    # Create a simple SMTP test script
    cat > test_smtp.js << 'EOF'
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
    try {
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
    } catch (error) {
        console.log('❌ SMTP connection failed:');
        console.log('   ', error.message);
        process.exit(1);
    }
}

testSMTP();
EOF
    
    node test_smtp.js
    rm test_smtp.js
}

update_deps() {
    echo -e "${BLUE}📦 Updating Dependencies...${NC}"
    echo -e "${BLUE}=========================${NC}"
    
    echo "🔍 Checking for updates..."
    npm outdated
    
    echo ""
    read -p "Do you want to update all dependencies? [y/N]: " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo "📦 Updating dependencies..."
        npm update
        echo -e "${GREEN}✅ Dependencies updated!${NC}"
    else
        echo "❌ Update cancelled"
    fi
}

# Main script logic
main() {
    case $1 in
        "status")
            check_status
            ;;
        "clean")
            clean_files
            ;;
        "backup")
            backup_data
            ;;
        "logs")
            view_logs
            ;;
        "test-smtp")
            test_smtp
            ;;
        "update")
            update_deps
            ;;
        "help"|""|*)
            show_help
            ;;
    esac
}

main "$@"
