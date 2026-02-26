**eTracking Email Utility - GUI Setup Complete! ✨**

Your GUI is ready to use. Here's how to get started:

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Email Settings
Edit your `.env` file with email credentials:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_NAME=eTracking Support
FROM_EMAIL=your-email@gmail.com
```

### Step 3: Start the GUI Server
**Windows (Batch):**
```bash
start-gui.bat
```

**Windows (PowerShell):**
```powershell
.\start-gui.ps1
```

**Or with npm:**
```bash
npm run gui
```

## 🌐 Access the GUI
Open your browser and go to: **http://localhost:3000**

## 📋 What's New

Your email utility now has:
- ✅ Modern web-based interface
- ✅ Drag-and-drop CSV upload
- ✅ Email template selection
- ✅ Live email preview
- ✅ Dry run mode for testing
- ✅ Production mode for sending
- ✅ Detailed results display

## 📁 File Structure

```
gui/
├── server.js          # Express server with API endpoints
├── public/
│   └── index.html     # Modern web interface
└── uploads/           # Temporary CSV upload storage
```

## 🔑 Environment Setup

If you haven't configured your email yet, follow these steps:

### For Gmail:
1. Enable 2-factor authentication
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxxx xxxx xxxx xxxx  (16-character app password)
   ```

### For Other SMTP Services:
1. Set `EMAIL_SERVICE` to blank or `smtp`
2. Add SMTP configuration:
   ```env
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   EMAIL_USER=username
   EMAIL_PASS=password
   ```

## 📖 How to Use

1. **Upload CSV**: Drag and drop or select your CSV file
2. **Select Template**: Choose from available email templates
3. **Preview**: Test the email for a specific customer
4. **Send**: 
   - Use Dry Run to test without sending
   - Use Production mode to send for real

## 🧪 Testing

Always start with a **Dry Run**:
1. Upload a test CSV with 1-2 records
2. Select a template
3. Preview the email
4. Click "Test (Dry Run)" to see what would be sent
5. Check results
6. Only switch to production when confident

## 💻 System Requirements

- Node.js 14+ (check with `node --version`)
- npm (comes with Node.js)
- 100MB free disk space
- Working internet connection for email sending

## 🔧 Advanced Configuration

### Change Server Port
Edit `.env`:
```env
GUI_PORT=3001
```

### Email Delay
Control delay between emails:
```env
EMAIL_DELAY=2000  # 2 seconds between emails
```

### Custom From Address
```env
FROM_NAME=Your Company Name
FROM_EMAIL=noreply@yourcompany.com
REPLY_TO=support@yourcompany.com
```

## 📊 Files Generated

- `logs/email-log.txt` - Email sending logs
- `gui/uploads/*` - Temporary CSV files
- `processed/*` - Processed email records

## 🆘 Troubleshooting

**Port 3000 already in use?**
- Change `GUI_PORT` in `.env`
- Or stop other Node processes using the port

**Email not sending?**
- Verify `.env` has correct credentials
- Check email configuration status in GUI
- Try dry run first
- Check `logs/email-log.txt` for errors

**CSV not uploading?**
- Ensure it's valid CSV format
- Check file has email column
- Try with smaller file first

## 📚 Documentation

- [GUI README](gui/README.md) - Detailed GUI documentation
- [Main README](README.md) - Original utility documentation

## 🎉 Next Steps

1. Install dependencies: `npm install`
2. Configure your email in `.env`
3. Start the GUI: `start-gui.bat` or `npm run gui`
4. Open http://localhost:3000
5. Upload a test CSV and send a test email!

---

**Questions or issues?** Check the GUI README and troubleshooting section!
