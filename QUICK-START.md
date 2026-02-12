# 🚀 Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Email Settings

Copy `.env.example` to `.env` and update with your email credentials:

```bash
cp .env.example .env
```

### For Zoho Mail (Recommended - eTracking Official):

Update `.env` with Zoho SMTP settings:

```bash
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=crm@etracking.pk
EMAIL_PASS=your-zoho-password
FROM_NAME=eTracking Support
FROM_EMAIL=cloud@etracking.pk
REPLY_TO=support@etracking.pk
```

### Alternative - For Gmail:

1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → App passwords
3. Update `.env`:

```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_NAME=eTracking Support
FROM_EMAIL=your-email@gmail.com
```

## Step 3: Add CSV Files

⚠️ **Important**:

1. Place your CSV files in the `customers/` folder
2. Update CSV files with actual customer email addresses!
3. After processing, files will be moved to `processed/` folder with timestamps

## Step 4: Test with Dry Run

```bash
# Preview all emails from all CSV files
npm run dev

# Preview specific customers
node src/index.js --dry-run --etc 0055 0221

# Preview by package type
node src/index.js --dry-run --package Platinum --limit 5
```

## Step 5: Send Emails

```bash
# Send to all customers from all CSV files
npm start

# Send to specific groups
node src/index.js --package Gold --expiry 7
node src/index.js --etc 0055 0221 0351
```

## � File Processing Workflow

1. **Add CSV files** to `customers/` folder
2. **Run application** (dry-run or live)
3. **Files are processed** and combined automatically
4. **After processing**, files are moved to `processed/` folder with timestamps
5. **Add new CSV files** to `customers/` for next batch

## 📋 Common Commands

| Command                | Description           |
| ---------------------- | --------------------- |
| `npm run dev`          | Dry run all CSV files |
| `npm test`             | Test with 1 customer  |
| `npm start`            | Send all emails       |
| `--dry-run`            | Preview mode          |
| `--etc 0055 0221`      | Specific customers    |
| `--package Gold`       | Filter by package     |
| `--expiry 7`           | Expiring in 7 days    |
| `--limit 10`           | Max 10 emails         |
| `--folder ./my-folder` | Custom CSV folder     |

## 🔒 Security Notes

- Use App Passwords, not main password
- Keep `.env` file private
- Test with `--dry-run` first
- Check logs in `logs/email-log.txt`
- Processed files are safely archived with timestamps
