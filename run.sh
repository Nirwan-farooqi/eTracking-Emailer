#!/bin/bash

# eTracking Email Utility - Run Script
# This script provides easy commands to run the email utility

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo -e "${BLUE}eTracking Email Utility - Run Script${NC}"
    echo -e "${BLUE}====================================${NC}"
    echo ""
    echo "Usage: ./run.sh [command] [options]"
    echo ""
    echo -e "${GREEN}Available Commands:${NC}"
    echo "  process     - Process CSV files and send renewal emails"
    echo "  dry-run     - Test run without actually sending emails"
    echo "  test        - Process only 1 customer for testing"
    echo "  help        - Show this help message"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./run.sh process              # Send emails to all customers"
    echo "  ./run.sh dry-run              # Test without sending"
    echo "  ./run.sh test                 # Test with 1 customer"
    echo ""
    echo -e "${GREEN}File Requirements:${NC}"
    echo "  • Place CSV files in: customers/"
    echo "  • Configure SMTP in: .env"
    echo "  • Payment image at: images/payment-options.jpeg"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Run ./setup.sh first.${NC}"
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Dependencies not installed. Running setup...${NC}"
        ./setup.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Setup failed. Please check error messages.${NC}"
            exit 1
        fi
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo -e "${RED}❌ .env file not found. Run ./setup.sh first.${NC}"
        exit 1
    fi
    
    # Check if customers directory exists and has CSV files
    if [ ! -d "customers" ]; then
        echo -e "${RED}❌ customers/ directory not found.${NC}"
        exit 1
    fi
    
    CSV_COUNT=$(find customers -name "*.csv" | wc -l)
    if [ "$CSV_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No CSV files found in customers/ directory.${NC}"
        echo -e "${YELLOW}   Please add your customer CSV files and try again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met!${NC}"
    echo -e "${GREEN}   Found $CSV_COUNT CSV file(s) in customers/${NC}"
}

# Function to run the application
run_app() {
    local command=$1
    local extra_args=$2
    
    echo -e "${BLUE}🚀 Starting eTracking Email Utility...${NC}"
    echo -e "${BLUE}====================================${NC}"
    
    case $command in
        "process")
            echo -e "${GREEN}📧 Processing CSV files and sending emails...${NC}"
            node src/index.js process $extra_args
            ;;
        "dry-run")
            echo -e "${YELLOW}🧪 Running in DRY RUN mode (no emails will be sent)...${NC}"
            node src/index.js process --dry-run $extra_args
            ;;
        "test")
            echo -e "${YELLOW}🧪 Running TEST mode (1 customer only)...${NC}"
            node src/index.js process --dry-run --limit=1 $extra_args
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $command${NC}"
            show_help
            exit 1
            ;;
    esac
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Operation completed successfully!${NC}"
        echo -e "${GREEN}📊 Check logs/ directory for detailed reports.${NC}"
    else
        echo ""
        echo -e "${RED}❌ Operation failed with exit code: $exit_code${NC}"
        echo -e "${RED}📋 Check the error messages above for details.${NC}"
    fi
    
    return $exit_code
}

# Main script logic
main() {
    # Check if script is run from the correct directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Please run this script from the email-utility directory.${NC}"
        exit 1
    fi
    
    # Handle command line arguments
    case $1 in
        "help"|"-h"|"--help"|"")
            show_help
            exit 0
            ;;
        "process"|"dry-run"|"test")
            check_prerequisites
            run_app $1 "${@:2}"
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run the main function with all arguments
main "$@"
