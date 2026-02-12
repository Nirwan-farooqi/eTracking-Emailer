# eTracking Email Utility - GUI

A modern web-based interface for managing and sending bulk emails from your email utility.

## 🌐 Features

- **Web-Based Interface**: Access via your browser at `http://localhost:3000`
- **File Upload**: Upload CSV files with drag-and-drop support
- **Template Selection**: Choose from available email templates
- **Email Preview**: Preview emails before sending
- **Dry Run Mode**: Test emails without actually sending
- **Production Mode**: Send emails for real
- **Results Display**: View detailed sending results with success/failure status
- **Configuration Status**: Check email service configuration

## 🚀 Quick Start

### Option 1: Using Batch File (Windows)
```bash
start-gui.bat
```

### Option 2: Using PowerShell
```powershell
.\start-gui.ps1
```

### Option 3: Using npm
```bash
npm run gui
```

## 📋 Requirements

1. **Node.js**: Make sure you have Node.js 14+ installed
2. **Email Configuration**: Your `.env` file must be configured with:
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASS`: Your email password or app password
   - `FROM_NAME`: Sender name
   - `FROM_EMAIL`: Sender email address
   - `SMTP_HOST` (optional): For SMTP connections
   - `SMTP_PORT` (optional): For SMTP connections

## 🔧 Installation

If this is your first time:

```bash
# Install dependencies
npm install

# Configure your email settings
cp .env.example .env
# Edit .env with your email credentials
```

## 📖 How to Use

### Step 1: Upload CSV
1. Click the upload area or drag a CSV file into it
2. The file will be parsed and you'll see:
   - Number of records
   - Column names
   - Sample data

### Step 2: Select Template
1. Choose an email template from the dropdown
2. Available templates include:
   - `device-addition`
   - `device-transfer`
   - `device-redo`
   - `new-account`
   - `renewal-pending`
   - `renewal-done`

### Step 3: Preview Email
1. Select which record to preview (0-based index)
2. Click "Preview Email" button
3. See how the email will look for that specific customer

### Step 4: Send Emails
1. Choose between:
   - **Dry Run**: Test mode without sending actual emails
   - **Production**: Send emails for real
2. Optionally set a limit (e.g., send to first 10 customers)
3. Click the appropriate send button
4. View detailed results for each email

## 📊 Email Configuration Status

The GUI displays your email configuration status on startup:
- ✅ **Configured**: All required email settings are present
- ❌ **Not Configured**: Missing email credentials

If not configured:
1. Create or edit your `.env` file
2. Add the required email credentials
3. Restart the GUI server

## 🔐 Environment Variables

Required for email sending:
```env
EMAIL_SERVICE=gmail                    # or smtp
EMAIL_USER=your-email@gmail.com        # Your email address
EMAIL_PASS=your-app-password           # Gmail App Password or SMTP password
FROM_NAME=eTracking Support            # Display name
FROM_EMAIL=your-email@gmail.com        # Reply-from address
REPLY_TO=info@example.com             # Optional reply-to address
EMAIL_DELAY=2000                       # Delay between emails (ms)

# Optional SMTP Configuration
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 📁 CSV Format

Your CSV file should include:
- `email`: Customer email address (required)
- `etc_number`: ETC number (for email subject)
- Other columns: Used in template placeholders

Example:
```csv
email,etc_number,customer_name,vehicle_reg,expiry_date
john@example.com,12345,John Doe,ABC-123,2026-03-31
```

## 🎨 Template Variables

Templates can use customer data like:
- `{{email}}`: Customer email
- `{{customer_name}}`: Customer name
- `{{etc_number}}`: ETC number
- `{{vehicle_reg}}`: Vehicle registration
- `{{expiry_date}}`: Expiry date
- Any other column from your CSV

## 🧪 Dry Run Mode

Perfect for testing:
1. Enable "Dry Run" checkbox (default)
2. Send emails normally
3. See what would be sent without actually sending
4. Check the results for any issues
5. Fix CSV or template if needed
6. Switch to Production mode when ready

## 📊 Results Page

After sending, you'll see:
- **✅ Sent**: Number of successfully sent emails
- **❌ Failed**: Number of failed emails
- **📊 Total**: Total emails processed
- Detailed table with each email and status

## 🚨 Troubleshooting

### Port Already in Use
If port 3000 is already in use, change it in `.env`:
```env
GUI_PORT=3001
```

### Email Not Sending
1. Check email configuration status on the GUI
2. Verify `.env` file has correct credentials
3. Try a dry run first to check template rendering
4. Check email service (Gmail requires app password, not regular password)

### CSV Not Uploading
1. Ensure file is valid CSV format
2. Check that file size is reasonable (< 50MB)
3. Ensure email column exists in CSV

### Template Not Found
1. Verify template name in templates/ folder
2. Template should have `.hbs` extension
3. Restart the server after adding new templates

## 🔗 API Endpoints

If you want to integrate with other tools:

- `GET /api/status` - Check email configuration
- `GET /api/templates` - List available templates
- `POST /api/upload` - Upload CSV file
- `POST /api/preview` - Preview email for a record
- `POST /api/send` - Send emails
- `GET /api/data` - Get current loaded data
- `POST /api/clear` - Clear current data

## 📝 Logs

Email sending logs are stored in `logs/email-log.txt`

## 🛑 Stopping the Server

1. In the terminal/PowerShell window running the server
2. Press `Ctrl+C`
3. Confirm by pressing `y` when asked

## 💡 Tips

- Always use dry run mode first to test
- Preview emails for different customer records
- Keep your `.env` file secure - don't share it
- Monitor the configuration status indicator
- Check results carefully before next batch

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review your `.env` configuration
3. Ensure all required environment variables are set
4. Check logs in `logs/email-log.txt`

## 🔄 Development

To run in development mode with auto-reload (requires nodemon):
```bash
npm install --save-dev nodemon
npm run gui-dev
```
