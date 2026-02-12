# eTracking Email Utility 📧

A comprehensive Node.js utility for sending renewal reminder emails to eTracking customers based on CSV data.

## 🚀 Quick Start

### Option 1: Interactive Setup & Run

```bash
./start.sh
```

This script will guide you through setup and provide interactive options.

### Option 2: Manual Steps

```bash
# 1. Initial setup
./setup.sh

# 2. Configure your settings (edit .env file)
# 3. Add CSV files to customers/ directory
# 4. Add payment QR image to images/

# 5. Run the application
./run.sh process
```

## 📋 Available Scripts

### 🔧 Setup Script (`./setup.sh`)

- Installs all Node.js dependencies
- Creates required directory structure
- Generates .env template file
- Validates Node.js installation

### ▶️ Run Script (`./run.sh`)

Main application runner with different modes:

```bash
./run.sh process    # Send emails to all customers
./run.sh dry-run    # Test without sending emails
./run.sh test       # Process only 1 customer
./run.sh help       # Show detailed help
```

### 🎯 Start Script (`./start.sh`)

Interactive quick-start script that:

- Runs setup if needed
- Provides menu for common actions
- Checks prerequisites automatically

### 🛠️ Utils Script (`./utils.sh`)

Maintenance and utility functions:

```bash
./utils.sh status      # Check system status
./utils.sh clean       # Clean logs and temp files
./utils.sh backup      # Backup configuration
./utils.sh logs        # View recent logs
./utils.sh test-smtp   # Test email connection
./utils.sh update      # Update dependencies
```

## 🚀 Features

- **CSV Processing**: Automatically groups customers by ETC number and processes vehicle data
- **Personalized Emails**: Dynamic email content with customer and vehicle details
- **Multiple Email Services**: Support for Gmail, SMTP, and SendGrid
- **Safety Features**: Dry-run mode, rate limiting, and comprehensive logging
- **Flexible Filtering**: Filter by ETC numbers, expiry dates, or package types
- **Professional Templates**: HTML email templates with proper styling
- **Error Handling**: Robust error handling and retry mechanisms

## 📋 Prerequisites

- Node.js 14+
- npm or yarn
- Email service credentials (Gmail App Password, SMTP, or SendGrid)

## 🔧 Installation

1. **Clone or download this project**

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

4. **Edit the `.env` file with your email credentials:**
   ```bash
   # For Gmail
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password  # Generate from Google Account Settings
   FROM_NAME=eTracking Support
   FROM_EMAIL=your-email@gmail.com
   REPLY_TO=info@etracking.pk
   ```

## 📧 Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security → App passwords
   - Select "Mail" and generate a password
   - Use this password in your `.env` file

## 🎯 Usage

### Basic Commands

```bash
# Dry run (preview emails without sending)
npm run dev

# Send emails to all customers
npm start

# Test with one customer only
npm test
```

### Advanced Usage

```bash
# Filter by specific ETC numbers
node src/index.js --etc 0055 0221 0351

# Filter by expiry date (customers expiring within 7 days)
node src/index.js --expiry 7

# Filter by package type
node src/index.js --package Gold

# Limit number of emails
node src/index.js --limit 5

# Combine filters
node src/index.js --package Platinum --expiry 30 --limit 10

# Skip confirmation prompt
node src/index.js --yes

# Dry run with filters
node src/index.js --dry-run --etc 0055 0221
```

### Command Line Options

| Option      | Description               | Example                      |
| ----------- | ------------------------- | ---------------------------- |
| `--csv`     | Path to CSV file          | `--csv ./data/customers.csv` |
| `--dry-run` | Preview without sending   | `--dry-run`                  |
| `--etc`     | Filter by ETC numbers     | `--etc 0055 0221`            |
| `--expiry`  | Days until expiry         | `--expiry 7`                 |
| `--package` | Filter by package type    | `--package Gold`             |
| `--limit`   | Limit email count         | `--limit 10`                 |
| `--delay`   | Delay between emails (ms) | `--delay 3000`               |
| `--yes`     | Skip confirmation         | `--yes`                      |
| `--verbose` | Detailed error output     | `--verbose`                  |

## 📂 Project Structure

```
email-utility/
├── src/
│   ├── index.js          # Main application entry point
│   ├── csvProcessor.js   # CSV parsing and customer grouping
│   ├── emailSender.js    # Email sending logic
│   └── templateEngine.js # Email template processing
├── templates/
│   ├── Expiry-Reminder.html    # Your original template
│   └── renewal-template.hbs    # Improved Handlebars template
├── logs/
│   └── email-log.txt     # Email sending logs
├── config/
├── .env                  # Environment variables (create from .env.example)
├── .env.example         # Environment variables template
└── package.json
```

## 📊 CSV Data Format

The application expects a CSV file with these columns:

- `ETC #`: Customer identifier
- `Customer Name`: Customer name
- `Customer Contact #`: Phone number
- `Vehicle Reg no.`: Vehicle registration
- `Vehicle Model`: Vehicle model
- `Package Activated`: Service package type
- `Payment Amount`: Renewal amount
- `Tenure Ending Date`: Service expiry date
- `CNIC no.`: Customer CNIC

## 📝 Email Template Customization

The application uses Handlebars templates with these variables:

- `{{customerName}}` - Customer name
- `{{etcNumber}}` - ETC reference number
- `{{totalAmount}}` - Total renewal amount
- `{{expiryDate}}` - Service expiry date
- `{{vehicles}}` - Array of vehicle objects
- `{{contactNumber}}` - Customer phone number
- `{{referenceNumber}}` - AMC reference number

## 📋 Logging

All email activities are logged to `logs/email-log.txt`:

- Successful sends with message IDs
- Failed attempts with error details
- Dry-run previews
- Processing errors

## ⚠️ Important Notes

1. **Email Addresses**: Update customer email addresses in your CSV file
2. **Rate Limiting**: Default 2-second delay between emails to avoid spam detection
3. **Testing**: Always use `--dry-run` first to preview emails
4. **Credentials**: Never commit your `.env` file to version control

## 🔍 Troubleshooting

### Common Issues

1. **"Authentication failed"**

   - Check your Gmail App Password
   - Ensure 2FA is enabled on Gmail
   - Verify EMAIL_USER and EMAIL_PASS in .env

2. **"No email address for customer"**

   - Update CSV with actual customer email addresses
   - Check CSV column headers match expected format

3. **"Template not found"**

   - Ensure template files exist in `/templates/` directory
   - Check file permissions

4. **CSV parsing errors**
   - Verify CSV format and column headers
   - Check for special characters or encoding issues

## 📞 Support

For issues or questions:

- Check the logs in `logs/email-log.txt`
- Run with `--verbose` flag for detailed errors
- Verify your CSV data format matches expectations

## 🔒 Security

- Store sensitive credentials in `.env` file only
- Use App Passwords instead of main email passwords
- Consider using professional email services for bulk sending
- Test thoroughly before sending to all customers
