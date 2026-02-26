# 🎉 Welcome to eTracking Email Utility - GUI Version

Your email utility now has a **modern web-based interface**! No more command line - just use your browser.

## ⚡ 3-Minute Setup

### 1️⃣ Configure Email (1 minute)
Create or edit `.env` file with your email settings:

**For Gmail:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
FROM_NAME=eTracking Support
FROM_EMAIL=your-email@gmail.com
```

**For Other Email Providers:**
```env
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
FROM_NAME=Your Company
FROM_EMAIL=your-email@example.com
```

### 2️⃣ Start the Server (1 minute)
**Windows Users - Double-click:**
```
start-gui.bat
```

**Or use PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File start-gui.ps1
```

**Or use npm:**
```bash
npm run gui
```

This will automatically:
- Check Node.js installation ✅
- Install dependencies if needed ✅
- Validate email configuration ✅
- Start the server ✅
- Open browser to http://localhost:3000 ✅

## 🌐 Using the GUI

The interface has **3 simple steps**:

### Step 1: 📤 Upload CSV
- Click the upload area or drag & drop your CSV file
- The system shows: number of records, columns, sample data

### Step 2: 👁️ Preview Email
- Enter record number (0 = first customer)
- Click "Preview Email"
- See the exact email that will be sent
- Template is automatically selected from CSV `email-template` column

### Step 3: ✉️ Send Emails

**First Time? Use Dry Run!**
- "Dry Run" is checked by default (safer)
- Click "Test (Dry Run)"
- Shows what would be sent WITHOUT actually sending
- Check results are correct

**Ready for Production?**
- Uncheck "Dry Run"
- Optionally set a limit (e.g., 10 for testing)
- Click "🚀 Send for Real"
- Confirm the dialog
- View detailed results

## 📊 Your CSV File Format

**Minimal CSV (required columns):**
```csv
email,email-template
john@example.com,renewal-pending
jane@example.com,new-account
```

**Better CSV (with customer data):**
```csv
email,customerName,cnic,contactNumber,etc_number,email-template,expiryDate,totalAmount
john@example.com,John Doe,12345-6789-0,0321-1234567,12345,renewal-pending,2026-03-31,Rs. 5000
jane@example.com,Jane Smith,23456-7890-1,0312-9876543,12346,new-account,2027-02-28,Rs. 6000
```

**Required columns:**
- `email` - Customer email address
- `email-template` - Template name (see below)

**Optional columns:**
- `customerName` - Customer name
- `cnic` - CNIC number
- `contactNumber` - Phone number
- `etc_number` - ETC number
- `expiryDate` - Expiry date
- `totalAmount` - Amount
- Any other column (passed to template)

**Available templates:**
- `renewal-pending` - Renewal reminder
- `renewal-done` - Renewal completed
- `new-account` - New account created
- `device-addition` - Device added
- `device-transfer` - Device transferred
- `device-redo` - Device reinstallation

## 🔐 Email Configuration Help

### Getting Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select Mail, Windows Computer
3. Google will generate a 16-character password
4. Copy it to `EMAIL_PASS` in `.env`

### For Other Email Services

Check with your email provider for:
- SMTP Host (e.g., smtp.gmail.com)
- SMTP Port (usually 587 or 465)
- Username (usually email address)
- Password or app password

## ✅ Quick Checklist

Before sending real emails:

- [ ] `.env` file created with email credentials
- [ ] Email configuration shows ✅ in GUI
- [ ] CSV file prepared with correct format
- [ ] Preview looks correct
- [ ] Dry run test successful
- [ ] Ready to send!

## 🧪 Testing Process (Recommended)

**1. Test with 1 customer:**
- Create CSV with 1 test customer
- Preview the email
- Use dry run (no email sent)
- Verify the mock results

**2. Test with 5 customers:**
- Create CSV with 5 test customers
- Use dry run
- Check all results show success

**3. Send for real (limited):**
- Set limit to 5
- Uncheck dry run
- Send real emails to test group
- Monitor email inboxes

**4. Full batch:**
- Upload complete CSV
- Leave limit empty
- Send all emails

## 📋 Configuration Status

On the GUI homepage, you'll see a status section showing:
- ✅ **Configured** - Email is ready to use
- ❌ **Not Configured** - Missing email credentials

If showing ❌, the GUI will show which credentials are missing. Update `.env` and restart the server.

## 🆘 Common Issues

**Browser won't open?**
- Manually open http://localhost:3000
- Check if port 3000 is available

**Port 3000 already in use?**
- Add to `.env`: `GUI_PORT=3001`
- Then use: http://localhost:3001

**Email won't send (Gmail)?**
- Don't use regular password
- Use 16-character **App Password** instead
- Enable 2-factor authentication first

**CSV won't upload?**
- Ensure it's saved as .csv (not .xlsx)
- Check first line has column headers
- Verify email column exists

**Preview shows error?**
- Check template name matches exactly
- Template file must exist in `templates/` folder
- Required columns: `email`, `email-template`

**"No CSV data loaded" error?**
- Upload a CSV file first
- Check CSV has proper format
- Verify email and email-template columns exist

## 📁 Important Files

```
├── .env                    ← Your email config (UPDATE THIS!)
├── start-gui.bat          ← Windows launcher (double-click)
├── start-gui.ps1          ← PowerShell launcher
├── gui/
│   ├── server.js          ← Backend API server
│   └── public/index.html  ← Web interface
├── src/
│   ├── templateEngine.js  ← Template rendering
│   └── emailSender.js     ← Email sending
├── templates/             ← Email templates (.hbs files)
├── customers/             ← CSV uploads
└── logs/email-log.txt    ← Email logs
```

## 🎯 Common Workflows

### Workflow 1: Send Renewal Reminders
1. Prepare CSV with customers needing renewal
2. Add `email-template` column with value `renewal-pending`
3. Upload to GUI
4. Preview & dry run
5. Send to all

### Workflow 2: New Account Emails
1. Export new customers to CSV
2. Add `email-template` column with value `new-account`
3. Upload to GUI
4. Verify template data
5. Test with 1 customer first
6. Send rest

### Workflow 3: Device Transfer Notifications
1. Get list of transferred devices in CSV
2. Add `email-template` column with value `device-transfer`
3. Upload to GUI
4. Preview for verification
5. Send in batches if needed

## 📊 Results & Logs

After sending, the GUI shows:
- ✅ **Sent** - Count of successfully sent emails
- ❌ **Failed** - Count of failed emails
- Full table with each email's status

Detailed logs saved to: `logs/email-log.txt`

## 🚀 Advanced Tips

**Sending in batches:**
- Use the "Limit" field to control batch size
- Send 50, then 50, etc.
- Helps avoid email provider rate limits

**Scheduling:**
- Send at off-peak hours
- Spread out large batches
- Wait between batches

**Monitoring:**
- Watch the results table
- Check logs for any errors
- Verify emails arrive in inbox

## 💾 Settings

Settings are saved in `.env`:
- Survives server restarts
- Same settings each time
- Keep secure - don't share!

## 🆘 Getting Help

1. Check this Getting Started guide
2. Review GUI error messages
3. Check `logs/email-log.txt` for detailed errors
4. Verify `.env` configuration

## 🎉 You're Ready!

**Next steps:**
1. ✅ Configure `.env` with email credentials
2. ✅ Run `start-gui.bat` or `start-gui.ps1`
3. ✅ Visit http://localhost:3000
4. ✅ Upload a test CSV
5. ✅ Send your first test email!

---

**Happy emailing! 📧**


## 🔐 Email Configuration Help

### Getting Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select Mail, Windows Computer
3. Google will generate a 16-character password
4. Copy it (with or without spaces) to `EMAIL_PASS` in `.env`

### For Other Email Services

Check with your email provider for:
- SMTP Host (e.g., smtp.gmail.com)
- SMTP Port (usually 587 or 465)
- Username (usually email address)
- Password or app password

## ✅ Checklist

Before sending real emails:

- [ ] `.env` file created with email credentials
- [ ] Email configuration shows ✅ in GUI
- [ ] CSV file uploaded with correct format
- [ ] Template selected
- [ ] Preview looks correct
- [ ] Dry run test successful
- [ ] Checked results

## 🧪 Testing Process (Recommended)

1. **Test with 1 customer:**
   - Upload CSV with 1 customer
   - Preview the email
   - Use dry run (no email sent)
   - Verify the mock results

2. **Test with 5 customers:**
   - Upload CSV with 5 test customers
   - Use dry run
   - Check all results show success

3. **Send for real (limited):**
   - Set limit to 5
   - Uncheck dry run
   - Send real emails to test group
   - Monitor email inboxes

4. **Full batch:**
   - Upload complete CSV
   - Leave limit empty
   - Send all emails

## 📋 Configuration Status

On the GUI homepage, you'll see a status section showing:
- ✅ **Configured** - Email is ready to use
- ❌ **Not Configured** - Missing email credentials

If showing ❌, the GUI will not send emails. Update `.env` and restart the server.

## 🆘 Common Issues

**Port 3000 already in use?**
- Add to `.env`: `GUI_PORT=3001`
- Then use: http://localhost:3001

**Email won't send (Gmail)?**
- Don't use regular password
- Use 16-character **App Password** instead
- Enable 2-factor authentication first

**CSV won't upload?**
- Ensure it's saved as .csv (not .xlsx)
- Check first line has column headers
- Verify email column exists

**Template shows weird characters?**
- CSV might be saved in wrong encoding
- Resave as UTF-8 (or without special chars)

**Preview shows error?**
- Check template file exists in `templates/` folder
- Verify template name matches exactly

## 📁 Important Files

```
├── .env                    ← Your email config (UPDATE THIS!)
├── start-gui.bat          ← Click to start GUI (Windows)
├── start-gui.ps1          ← PowerShell version
├── gui/
│   ├── server.js          ← Backend server
│   └── public/index.html  ← Web interface
├── src/
│   ├── templateEngine.js  ← Template rendering
│   └── emailSender.js     ← Actual email sending
├── templates/             ← Email templates (.hbs files)
├── customers/             ← CSV upload folder
└── logs/email-log.txt    ← Email sending logs
```

## 🎯 Common Workflows

### Workflow 1: Regular Renewal Reminders
1. Prepare CSV with customers needing renewal
2. Upload to GUI
3. Select `renewal-pending` template
4. Preview & dry run
5. Send to all

### Workflow 2: New Account Setup Emails
1. Export new customers to CSV
2. Upload to GUI
3. Select `new-account` template
4. Verify template data matches CSV columns
5. Test with 1 customer first
6. Send rest

### Workflow 3: Device Transfer Notifications
1. Get list of transferred devices in CSV
2. Upload to GUI
3. Select `device-transfer` template
4. Preview email for each type
5. Send in batches if needed

## 📊 Results & Logs

After sending, the GUI shows:
- ✅ **Sent** - Count of successfully sent emails
- ❌ **Failed** - Count of failed emails
- Full table with each email's status

Detailed logs saved to: `logs/email-log.txt`

## 🚀 Advanced Tips

**Sending in batches:**
- Use the "Limit" field
- Send 50, then 50, etc.
- Helps avoid getting blocked

**Scheduling:**
- Send at off-peak hours
- Spread out large batches
- Wait 2-3 minutes between batches

**Monitoring:**
- Watch the results table
- Check logs for any errors
- Verify emails arrive in inbox

## 🔗 Keyboard Shortcuts

- `Ctrl+C` - Stop the server
- `F5` or `Ctrl+R` - Refresh the web page
- Clear all data - Use "Clear Data" button

## 💾 Saving Your Settings

Settings are saved in `.env`:
- Survives server restarts
- Same settings each time
- Keep secure - don't share!

## 🆘 Getting Help

1. Check this Getting Started guide
2. Read `gui/README.md` for detailed info
3. Check `logs/email-log.txt` for errors
4. Review your `.env` configuration

## 🎉 You're Ready!

That's it! You're now ready to use your email utility with a modern GUI.

**Next steps:**
1. ✅ Run `npm install`
2. ✅ Configure `.env`
3. ✅ Run `start-gui.bat`
4. ✅ Visit http://localhost:3000
5. ✅ Upload a test CSV
6. ✅ Send your first test email!

---

**Happy emailing! 📧**

For questions or issues, check the troubleshooting section in `gui/README.md`
