# 📋 Quick Reference Card

## 🚀 Launch Commands

```bash
# Windows Batch File (Easiest)
start-gui.bat

# PowerShell
.\start-gui.ps1

# Or using npm
npm run gui
```

## 📍 Access Points

```
Web Browser:  http://localhost:3000
Server Logs:  Terminal/PowerShell window
Email Logs:   logs/email-log.txt
```

## 🎯 4-Step Workflow

| Step | Action | Icon |
|------|--------|------|
| 1 | Drag CSV file | 📤 |
| 2 | Select template | 🎨 |
| 3 | Preview email | 👁️ |
| 4 | Send (test/real) | ✉️ |

## 🔑 Required Configuration (.env)

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_NAME=Your Company
FROM_EMAIL=sender@example.com
```

## ✅ Pre-Flight Checklist

- [ ] `.env` configured
- [ ] Dependencies installed (`npm install`)
- [ ] CSV prepared with email column
- [ ] Template selected
- [ ] Preview looks correct
- [ ] Dry run successful

## 📊 CSV Column Requirements

**Minimum:**
- `email` (required)

**Common:**
- `customer_name`
- `etc_number`
- `vehicle_reg`
- `expiry_date`

## 🎨 Available Templates

- `device-addition`
- `device-transfer`
- `device-redo`
- `new-account`
- `renewal-pending`
- `renewal-done`

(In `templates/` folder with `.hbs` extension)

## 🧪 Testing Procedure

1. Upload test CSV (1-5 records)
2. Select template
3. Click Preview
4. Check "Dry Run" is enabled
5. Click "Test (Dry Run)"
6. Review results
7. If OK → Uncheck Dry Run
8. Click "🚀 Send for Real"

## 🆘 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Port in use | Set `GUI_PORT=3001` in .env |
| Email not sending | Check .env credentials |
| CSV won't upload | Save as UTF-8 .csv |
| Template not found | Verify file in templates/ |
| Gmail auth fails | Use 16-char app password |

## 📱 Browser Support

✅ Chrome/Chromium  
✅ Firefox  
✅ Edge  
✅ Safari  
✅ Any modern browser  

## ⌨️ Keyboard Tips

```
Ctrl+C  → Stop server
F5      → Refresh page
Ctrl+R  → Refresh page
Tab     → Jump between fields
Enter   → Submit forms
```

## 📊 Results Display

Results table shows:
- Email address
- Status (✅ Success / ❌ Failed)
- Message (sent/error details)

Export/print from browser: `Ctrl+P`

## 🔐 Security Reminders

- Keep `.env` file private
- Don't share `.env` publicly
- Don't commit `.env` to git
- Credentials are local only
- No data sent to external servers

## 💾 Important Directories

```
gui/uploads/        → Temporary files (auto-cleaned)
logs/email-log.txt  → Email sending history
templates/          → Email templates
processed/          → Successfully processed files
customers/          → Input CSV files
```

## 🎛️ Configuration Options

| Setting | Default | Example |
|---------|---------|---------|
| GUI_PORT | 3000 | 3001 |
| EMAIL_DELAY | 2000 | 5000 |
| EMAIL_SERVICE | gmail | smtp |

## ⏱️ Timing

| Action | Time |
|--------|------|
| Server startup | ~2 sec |
| File upload | ~1-5 sec |
| Preview | ~500ms |
| Email per recipient | ~2 sec |

## 📞 Support Resources

1. **GETTING-STARTED-GUI.md** - Full walkthrough
2. **gui/README.md** - Detailed documentation
3. **logs/email-log.txt** - Error messages
4. **.env file** - Configuration reference

## 🌐 API Quick Reference

```
GET  /api/status      → Check email config
GET  /api/templates   → List templates
POST /api/upload      → Upload CSV
POST /api/preview     → Preview email
POST /api/send        → Send emails
GET  /api/data        → Get loaded data
POST /api/clear       → Clear data
```

## 🛑 Stopping the Server

```
Method 1: Press Ctrl+C in terminal
Method 2: Close terminal window
Method 3: Kill process in Task Manager
```

## 🔄 Restarting

```bash
# After changes or errors
start-gui.bat

# Or
npm run gui
```

## 📈 Batch Sending Best Practices

- Test with 1-5 records first
- Use dry run before production
- Set limits for safety (e.g., 50 at a time)
- Wait 2-3 minutes between batches
- Monitor email responses
- Check logs for failures
- Retry failed emails separately

## 🎯 Common Tasks

**Send renewal reminders:**
1. Upload renewal CSV
2. Select `renewal-pending`
3. Preview & dry run
4. Send all

**Send new account notifications:**
1. Upload new customers CSV
2. Select `new-account`
3. Test with 1 customer
4. Send remaining

**Device transfer notification:**
1. Upload transfers CSV
2. Select `device-transfer`
3. Preview
4. Send

## ⚠️ Common Mistakes to Avoid

- ❌ Forgetting to configure .env
- ❌ Using regular Gmail password (need app password)
- ❌ Sending without preview first
- ❌ Skipping dry run on large batches
- ❌ Uploading wrong CSV format
- ❌ Not checking results after sending

## ✅ Best Practices

- ✅ Always test with dry run first
- ✅ Preview email before sending
- ✅ Use app passwords for Gmail
- ✅ Monitor results table
- ✅ Check logs for errors
- ✅ Test with 1 customer first
- ✅ Keep .env secure
- ✅ Verify CSV format before upload

## 🎓 Learning Path

1. **Start**: Read GETTING-STARTED-GUI.md
2. **Setup**: Configure .env
3. **Practice**: Upload test CSV, preview, dry run
4. **Learn**: Read gui/README.md
5. **Master**: Understand ARCHITECTURE.md
6. **Optimize**: Use batch sending best practices

## 💡 Pro Tips

- Drag multiple CSVs = test different templates
- Set limit field = safer batch testing
- Preview different records = verify template works
- Check logs = understand what happened
- Use descriptive CSV filenames = easy tracking
- Schedule batches = avoid bulk sending limits

## 🚀 Performance Tips

- Smaller CSVs = faster upload
- Batch in groups of 50-100 = avoid timeouts
- Off-peak sending = better delivery
- Monitor system resources = keep PC responsive

---

**Bookmark this page for quick reference!** 📍
