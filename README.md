# eTracking Emailer

Automated renewal-reminder and notification email system for **eTracking Solutions**. Sends personalised HTML emails to customers based on CSV data exported from the team records sheet. Supports multi-vehicle accounts (one email per customer, all vehicles listed), multiple email templates, Markdown notes, and both a GUI portal and a CLI.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration (.env)](#configuration-env)
6. [CSV Format](#csv-format)
7. [Email Templates](#email-templates)
8. [GUI Portal](#gui-portal)
9. [CLI Usage](#cli-usage)
10. [How It Works — Full Pipeline](#how-it-works--full-pipeline)
11. [Logs](#logs)
12. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
CSV File(s)
    │
    ▼
CSVBatchProcessor          ← groups all rows by ETC number
    │                         (multi-vehicle customers → 1 customer object)
    ▼
TemplateEngine             ← generates personalised HTML via Handlebars
    │                         (supports Markdown in notes/credentials)
    ▼
EmailSender                ← sends via Nodemailer (SMTP / Zoho / Gmail)
    │                         (attaches payment-options.jpeg as inline CID
    │                          for renewal-pending template)
    ▼
logs/email-log.txt         ← append-only send log
```

Two entry points share the same core pipeline:

| Mode | Entry point | Use case |
|------|-------------|----------|
| **GUI** | `node gui/server.js` | Browser-based portal, upload CSV, preview, send with live progress |
| **CLI** | `node src/index.js` | Terminal-based, processes `customers/` folder, supports filters |

---

## Project Structure

```
eTracking-Emailer/
├── src/
│   ├── index.js               # CLI entry point
│   ├── csvBatchProcessor.js   # CSV parsing + grouping by ETC
│   ├── csvProcessor.js        # Legacy single-file processor
│   ├── emailSender.js         # Nodemailer send logic + logging
│   └── templateEngine.js      # Handlebars rendering + Markdown support
├── gui/
│   ├── server.js              # Express API server (GUI backend)
│   └── public/
│       ├── index.html         # Main GUI portal
│       └── manual.html        # User manual
├── templates/
│   ├── renewal-pending.hbs    # Renewal reminder email
│   ├── renewal-done.hbs       # Renewal confirmed email
│   ├── new-account.hbs        # New account welcome email
│   ├── device-transfer.hbs    # Device transfer notification
│   ├── device-redo.hbs        # Device reinstallation notification
│   ├── device-addition.hbs    # New device added notification
│   └── payment-options.jpeg   # Inline payment QR image
├── customers/                 # Place CSV files here for CLI mode
├── processed/                 # CLI moves processed CSVs here
├── logs/
│   └── email-log.txt          # All send activity log
├── output/                    # Dry-run HTML preview files
├── docs/                      # Reference documentation (architecture, setup guides, changelogs)
├── tests/                     # Test scripts and sample files
├── start-gui.bat              # Windows launcher (double-click to start)
├── start-gui.ps1              # PowerShell launcher
├── package.json
└── .env                       # Email credentials (not committed)
```

---

## Prerequisites

- **Node.js** v16 or later
- **npm** v8 or later
- An email account with SMTP access (Zoho, Gmail, etc.)

---

## Installation

```bash
git clone https://github.com/Nirwan-farooqi/eTracking-Emailer.git
cd eTracking-Emailer
npm install
```

---

## Configuration (.env)

Copy `.env.example` to `.env` and fill in your credentials:

```env
# Email Service: "zoho" | "gmail" | "smtp"
EMAIL_SERVICE=zoho

# SMTP credentials
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password

# Custom SMTP (required if EMAIL_SERVICE is not gmail/zoho)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_SECURE=true

# Sender identity
FROM_NAME=eTracking Solutions
FROM_EMAIL=your@email.com
REPLY_TO=info@etracking.pk
CC_EMAIL=team@etracking.pk

# Delay between emails in milliseconds (default: 2000)
EMAIL_DELAY=2000

# Optional: Port for GUI server (default: 3000)
GUI_PORT=3000

# Optional: Custom email subjects per template
email-title-renewal-pending=Annual Renewal Reminder
email-title-renewal-done=Renewal Confirmation
email-title-new-account=Welcome to eTracking
email-title-device-transfer=Device Transfer Complete
email-title-device-redo=Device Reinstallation Complete
email-title-device-addition=New Device Added
```

---

## CSV Format

The system reads CSVs exported from the team records sheet. Required columns:

| Column | Description |
|--------|-------------|
| `ETC-number` | Unique customer account number (e.g. `0055`) |
| `Customer-Name` | Full customer name |
| `Customer-Contact` | Phone number(s) |
| `Send-Email-To` | Recipient email address |
| `CNIC` | CNIC / NTN number |
| `Vehicle-Rank` | Vehicle sequence number within the account |
| `Vehicle-Reg-number` | Registration number |
| `Vehicle-Model` | Vehicle make and model |
| `Package-Activated` | Package name (e.g. `LTV Platinum`) |
| `Payment-Amount` | Amount due (e.g. `Rs 8,000`) |
| `Tenure-Start-Date` | Service start date (e.g. `23-Mar-2025`) |
| `Tenure-Ending-Date` | Service expiry date |
| `Tenure-Length` | Duration (e.g. `1 Year`) |
| `email-template` | Template to use (see Email Templates section) |
| `notes` | Optional Markdown notes shown in email |
| `installation-date` | New-account field |
| `credentials` | New-account field (supports Markdown) |
| `mobile-for-alerts` | Alert mobile number |
| `geofence-city` | Geofence city |

### Multi-vehicle accounts

If a customer has **multiple vehicles**, each vehicle is a separate row with the **same `ETC-number`**. The system automatically groups them into **one email** listing all vehicles in a table, with the total amount summed and the earliest expiry date used for the expiry reminder.

### Empty rows

Trailing empty rows (e.g. from Excel exports) are automatically ignored.

---

## Email Templates

Place `.hbs` (Handlebars) files in the `templates/` folder. The `email-template` column in the CSV selects which template is used per customer.

| Template value | File | Use case |
|----------------|------|----------|
| `renewal-pending` | `renewal-pending.hbs` | Annual renewal reminder + payment info |
| `renewal-done` | `renewal-done.hbs` | Renewal payment confirmed |
| `new-account` | `new-account.hbs` | New customer welcome + account details |
| `device-transfer` | `device-transfer.hbs` | Vehicle device transferred |
| `device-redo` | `device-redo.hbs` | Device reinstalled |
| `device-addition` | `device-addition.hbs` | New device added to account |

### Available template variables

```handlebars
{{customerName}}       {{etcNumber}}       {{cnic}}
{{contactNumber}}      {{email}}           {{referenceNumber}}
{{totalVehicles}}      {{totalDevices}}    {{totalAmount}}
{{expiryDate}}         {{currentDate}}     {{serviceTypes}}
{{installationDate}}   {{credentials}}     {{alertMobile}}
{{residentCity}}       {{{notes}}}

{{#each vehicles}}
  {{rank}}  {{regNumber}}  {{model}}  {{package}}
  {{amount}}  {{startDate}}  {{endDate}}  {{tenureLength}}
{{/each}}
```

The `payment-options.jpeg` image is embedded as an inline CID attachment for the `renewal-pending` template.

---

## GUI Portal

### Starting the server

```bash
node gui/server.js
# Open http://localhost:3000
```

Or via npm:

```bash
npm run gui
```

### Workflow

1. **Upload CSV** — drag-and-drop or click to select. The system groups rows by ETC number and shows unique customer count.
2. **Preview** — type a record number and click Preview to see the rendered email in a panel.
3. **Send** — click Send Emails. A live progress bar shows `Sending... 12 / 56 ✅ 12 ❌ 0` and each result row appears in real-time as emails are sent.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/status` | Check email config |
| `POST` | `/api/upload` | Upload + parse CSV (returns grouped customers) |
| `POST` | `/api/preview` | Render email HTML for a given record index |
| `GET` | `/api/send-stream` | SSE stream — sends all emails with real-time progress |
| `GET` | `/api/data` | Get currently loaded customer data |
| `POST` | `/api/clear` | Clear loaded data |

---

## CLI Usage

Place CSV files in the `customers/` folder, then run:

```bash
# Preview all (no emails sent)
node src/index.js --dry-run

# Send all
node src/index.js

# Send to specific ETC numbers
node src/index.js --etc 0055 0221 0189

# Send to customers expiring within 7 days
node src/index.js --expiry 7

# Filter by package type
node src/index.js --package Platinum

# Limit to first 10 customers
node src/index.js --limit 10

# Custom CSV folder
node src/index.js --folder ./my-exports

# Skip confirmation prompt
node src/index.js --yes

# Increase delay between emails
node src/index.js --delay 3000
```

After a successful run, processed CSV files are moved to the `processed/` folder and their hashes recorded so re-running skips unchanged files.

---

## How It Works — Full Pipeline

```
1. CSV Upload / folder scan
   └─ CSVBatchProcessor.processSingleCSV()
      ├─ Reads all rows with csv-parser
      ├─ Standardizes date formats
      └─ groupCustomersByETC()
          ├─ Creates one customer object per unique ETC number
          ├─ Pushes each row s vehicle data into customer.vehicles[]
          ├─ Accumulates customer.totalAmount
          └─ Tracks customer.earliestExpiry

2. Template resolution
   └─ finalizeCustomerTemplates()
      └─ Reads email-template from each vehicle row
         (priority: renewal-done > device-* > new-account > renewal-pending)

3. Email rendering
   └─ TemplateEngine.generateEmail(customer)
      ├─ Loads and caches .hbs template
      ├─ Builds templateData (formats currency, dates, renders Markdown)
      └─ Returns compiled HTML string

4. Email sending
   └─ EmailSender.sendEmail(customer, html)
      ├─ Builds subject from .env or fallback
      ├─ Attaches payment-options.jpeg (renewal-pending only)
      ├─ Sends via Nodemailer transporter
      └─ Appends result to logs/email-log.txt

5. GUI real-time progress (SSE)
   └─ /api/send-stream
      ├─ Sends one SSE event after each email
      └─ Browser updates progress bar + results table live
```

---

## Logs

All email send activity is appended to `logs/email-log.txt`:

```
2026-02-26T10:00:00.000Z | SUCCESS | ETC: 0055 | John Doe | john@example.com | Message ID: ...
2026-02-26T10:00:02.000Z | FAILED  | ETC: 0221 | Jane Doe | jane@example.com | Connection timeout
2026-02-26T10:00:04.000Z | DRY_RUN | ETC: 0189 | Iqbal    | iqbal@example.com | Email prepared but not sent
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing environment variables` | Fill in all required fields in `.env` |
| Row count too high (e.g. 375 instead of 83) | Excel adds empty rows — auto-skipped |
| `Template xyz not found` | Add `xyz.hbs` to `templates/` or fix `email-template` column |
| Payment image missing in preview | Fixed — base64 encoded for browser, CID used in real emails |
| Email sent to wrong address | Check `Send-Email-To` column in CSV |
| SMTP auth error | Use an App Password, not your login password |
| Emails going to spam | Ensure `FROM_EMAIL` matches `EMAIL_USER`; check SPF/DKIM |
