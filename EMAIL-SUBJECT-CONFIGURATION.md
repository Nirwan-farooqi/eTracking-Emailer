# Email Subject Configuration

## Overview

Email subject lines are configured in the `.env` file and automatically include the customer's reference number.

## How It Works

### Subject Line Format

All email subjects follow this format:

```
[Email Title from .env] - AMC2570-[ETC Number]
```

**Example:**

- Email title in .env: `Welcome to eTracking - New Account Setup Complete`
- Customer ETC Number: `1234`
- **Final subject:** `Welcome to eTracking - New Account Setup Complete - AMC2570-1234`

### Reference Number

The reference number `AMC2570-${etcNumber}` is automatically appended to all email subjects in `src/emailSender.js` at line 70.

**Format:** `AMC2570-[ETC Number]`

**Examples:**

- ETC #1234 → Reference: AMC2570-1234
- ETC #5678 → Reference: AMC2570-5678

## Current Email Titles

### .env Configuration

```properties
# Email Subject Titles (Reference number AMC2570-XXX is automatically appended)
email-title-new-account=Welcome to eTracking - New Account Setup Complete
email-title-renewal-pending=eTracking Service Renewal Payment Pending
email-title-renewal-done=eTracking Service Renewal Confirmed - Invoice Generated
email-title-device-transfer=eTracking Device Transfer Completed Successfully
email-title-device-redo=eTracking Device Reinstallation Completed Successfully
```

### Template → Subject Mapping

| Template Name     | Email Subject                                                          |
| ----------------- | ---------------------------------------------------------------------- |
| `new-account`     | Welcome to eTracking - New Account Setup Complete - AMC2570-XXXX       |
| `renewal-pending` | eTracking Service Renewal Payment Pending - AMC2570-XXXX               |
| `renewal-done`    | eTracking Service Renewal Confirmed - Invoice Generated - AMC2570-XXXX |
| `device-transfer` | eTracking Device Transfer Completed Successfully - AMC2570-XXXX        |
| `device-redo`     | eTracking Device Reinstallation Completed Successfully - AMC2570-XXXX  |

## Customizing Email Titles

### To Change an Email Subject:

1. Open `.env` file
2. Find the line for your template (e.g., `email-title-new-account=...`)
3. Update the text after the `=` sign
4. Save the file
5. Restart the application

### Example Customization:

**Before:**

```properties
email-title-new-account=Welcome to eTracking - New Account Setup Complete
```

**After:**

```properties
email-title-new-account=🎉 Your eTracking Account is Ready
```

**Result:**

```
Subject: 🎉 Your eTracking Account is Ready - AMC2570-1234
```

## Best Practices

### ✅ Do's

- Keep subjects clear and concise (under 60 characters when possible)
- Start with action words or clear status indicators
- Include brand name "eTracking" for recognition
- Use professional language
- Test subject lines in different email clients

### ❌ Don'ts

- Don't use ALL CAPS (looks like spam)
- Don't include the reference number manually (it's auto-added)
- Don't use excessive punctuation (!!!)
- Don't exceed 78 characters (gets truncated in some clients)
- Don't use special characters that may not display properly

## Code Implementation

### Location: `src/emailSender.js`

```javascript
const getSubjectFromEnv = (templateName, etcNumber) => {
  const envKey = `email-title-${templateName}`;
  const envTitle = process.env[envKey];

  if (envTitle) {
    return `${envTitle} - AMC2570-${etcNumber}`;
  }

  // Fallback to hardcoded subjects if env not found
  const fallbackSubjects = {
    "renewal-pending": `Vehicle Tracking Service Renewal Reminder - ETC #${etcNumber}`,
    "renewal-done": `Vehicle Tracking Service Renewal Confirmation - ETC #${etcNumber}`,
    "new-account": `Welcome to eTracking - Your Account Setup Complete - ETC #${etcNumber}`,
  };

  return fallbackSubjects[templateName] || fallbackSubjects["renewal-pending"];
};
```

### How to Add a New Template Subject:

1. **Add to .env:**

   ```properties
   email-title-my-new-template=My Custom Email Subject
   ```

2. **Create the template file:**

   ```
   templates/my-new-template.hbs
   ```

3. **Use in CSV:**
   Set `emailTemplate` field to `my-new-template`

The system will automatically pick up the subject from .env and append the reference number.

## Reference Number Format

### Structure: `AMC2570-[ETC Number]`

- **AMC2570**: Fixed prefix (Annual Maintenance Contract + company code)
- **ETC Number**: Customer's unique identifier from CSV

### Where It's Used:

1. Email subject line
2. Email body (in account details table as "Reference Number")
3. Internal tracking and logging

### Why This Format?

- **AMC2570**: Identifies it as an Annual Maintenance Contract for easy filtering
- **ETC Number**: Unique customer identifier for quick lookup
- **Combined**: Creates a unique reference for each customer interaction

## Troubleshooting

### Subject Not Updating

**Problem:** Changed .env but subject still shows old text
**Solution:** Restart the application. Environment variables are loaded at startup.

### Missing Template Subject

**Problem:** New template doesn't have a subject configured
**Solution:**

1. Add `email-title-[template-name]=Your Subject` to .env
2. OR update the fallback subjects in `emailSender.js`

### Reference Number Not Showing

**Problem:** Subject doesn't include AMC2570-XXXX
**Solution:** Check that `customer.etcNumber` is properly set in your CSV data

## Examples of Good Subject Lines

### ✅ Current Subjects (Recommended)

- `Welcome to eTracking - New Account Setup Complete - AMC2570-1234`
- `eTracking Service Renewal Payment Pending - AMC2570-1234`
- `eTracking Service Renewal Confirmed - Invoice Generated - AMC2570-1234`
- `eTracking Device Transfer Completed Successfully - AMC2570-1234`
- `eTracking Device Reinstallation Completed Successfully - AMC2570-1234`

### ✅ Alternative Good Subjects

- `eTracking: Your Service is Now Active - AMC2570-1234`
- `Action Required: Renew Your eTracking Service - AMC2570-1234`
- `Thank You: eTracking Payment Received - AMC2570-1234`
- `Completed: Device Transfer to New Vehicle - AMC2570-1234`

### ❌ Poor Subject Examples

- `URGENT!!! PAYMENT NOW!!!` (too aggressive, all caps)
- `Your eTracking account has been created and is now ready to use with all features enabled` (too long)
- `hey dude ur account is ready` (too casual, unprofessional)
- `Re: Re: Fwd: Account` (confusing, looks like spam)

---

**Last Updated:** October 21, 2025
**Configuration File:** `.env`
**Implementation File:** `src/emailSender.js`
