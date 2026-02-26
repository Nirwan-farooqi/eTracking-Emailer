# CSV Column Name Fix Applied

## Issue Found

Your CSV file uses **hyphenated column names** (e.g., `Customer-Name`, `Vehicle-Rank`, `notes`)

The CSV processor wasn't checking for these hyphenated variations for some fields.

## Changes Made to `csvProcessor.js`

### 1. Customer Name Field

**Before:** Only checked `Customer Name` and `customerName`
**After:** Also checks `Customer-Name`

### 2. Contact Number Field

**Before:** Only checked `Customer Contact #` and `contactNumber`
**After:** Also checks `Customer-Contact`

### 3. CNIC Field

**Before:** Only checked `CNIC no.` and `cnic`
**After:** Also checks `CNIC`

### 4. Notes Field

**Before:** Only checked `Notes` and `notes`
**After:** Also checks `notes`, `NOTES` (all case variations)

### 5. Email Field

**Before:** Only checked `eTrack User-1` and `email`
**After:** **Now checks `Send-Email-To` first** (your actual column name!)

### 6. Vehicle Fields

Added support for hyphenated versions:

- `Vehicle-Rank`
- `Vehicle-Reg-number`
- `Vehicle-Model`
- `Package-Activated`
- `Payment-Amount`
- `Tenure-Start-Date`
- `Tenure-Ending-Date`
- `Tenure-Length`

## To Test Notes Feature

### Step 1: Add Notes to Your CSV

Edit your CSV file and add notes to the `notes` column (column 15):

```csv
ETC-number,Customer-Name,Customer-Contact,...,notes,installation-date,...
0429,Test Customer,923055284662,...,**URGENT:** Install before Friday,12-07-2025,...
```

### Step 2: Move CSV to customers folder

```bash
mv processed/2025-10-21T13-32-31-445Z_test-5-temps-125.csv customers/
```

### Step 3: Run the utility

```bash
npm start -- --dry-run
```

### Step 4: Check Output

Check `output/` folder for the generated HTML and look for:

```html
<tr>
  <td class="label">Additional Notes</td>
  <td class="value"><strong>URGENT:</strong> Install before Friday</td>
</tr>
```

## Current CSV Structure (Detected)

Your CSV has these columns:

```
1.  ETC-number
2.  Customer-Name
3.  Customer-Contact
4.  Vehicle-Rank
5.  Vehicle-Reg-number
6.  Vehicle-Model
7.  Send-Email-To
8.  Package-Activated
9.  Payment-Amount
10. Tenure-Start-Date
11. Tenure-Length
12. Tenure-Ending-Date
13. CNIC
14. email-template
15. notes               ← CURRENTLY EMPTY
16. installation-date
17. credentials
18. mobile-for-alerts
19. geofence-city
```

## Summary

✅ **Fixed:** CSV processor now handles hyphenated column names
✅ **Fixed:** Email extraction now looks for `Send-Email-To` column
✅ **Ready:** Notes column will be processed when you add data

**Action Required:** Add actual note text to the `notes` column in your CSV file.

---

**Example Notes You Can Add:**

```csv
notes
**VIP Customer** - Priority installation required
Customer requested SMS alerts and geofence setup
**Follow-up:** Call within 24 hours after installation
Device needs special mounting - check with technical team
```

**With Markdown Formatting:**

- Use `**text**` for bold
- Use `*text*` for italic
- Use `- item` for bullet lists
- Use `1. item` for numbered lists
- Use `[text](url)` for links
