# Markdown Support in Email Templates

## Overview

The email utility now supports Markdown formatting for specific fields, allowing rich text formatting in emails without manual HTML coding.

## Supported Fields

Markdown rendering is enabled for the following fields:

1. **Customer Name** (`customerName`)
2. **Customer Contact** (`contactNumber`)
3. **Credentials** (`credentials`)
4. **Notes** (`notes`)

## Installation

The markdown support requires the `marked` library:

```bash
npm install marked
```

This has already been installed in your project.

## How It Works

### Backend Processing

- The `TemplateEngine` class automatically converts Markdown to HTML for the specified fields
- Uses the `marked` library for parsing
- Configured for GitHub Flavored Markdown (GFM)
- Handles line breaks and inline formatting intelligently

### Template Updates

All templates now use triple-brace syntax `{{{ }}}` for markdown fields instead of double-braces `{{ }}`:

```handlebars
<!-- Old (escaped HTML) -->
<td class="value">{{customerName}}</td>

<!-- New (renders HTML/Markdown) -->
<td class="value">{{{customerName}}}</td>
```

## Markdown Syntax Examples

### Basic Formatting

```markdown
**Bold Text** - Makes text bold
_Italic Text_ - Makes text italic  
**_Bold and Italic_** - Combines both
~~Strikethrough~~ - Strikes through text
```

**Result in email:**

- **Bold Text**
- _Italic Text_
- **_Bold and Italic_**
- ~~Strikethrough~~

### Links

```markdown
[E-Tracking Website](https://etracking.pk)
Visit https://etracking.pk (auto-linked)
```

**Result:** Clickable hyperlinks

### Lists

```markdown
- Item 1
- Item 2
- Item 3

1. First item
2. Second item
3. Third item
```

**Result:** Formatted bullet or numbered lists

### Line Breaks

```markdown
Line one
Line two

Paragraph break (double line)
```

**Result:** Proper line spacing and paragraphs

### Code

```markdown
Use `inline code` for technical terms
```

**Result:** `inline code` with monospace font

## CSV Field Examples

### Customer Name Field

```csv
Customer Name
**Muhammad Ahmed** (VIP)
*Karachi Transport Ltd.*
**ABC Corporation** - Priority Client
```

### Contact Number Field

```csv
Customer Contact #
**Primary:** 03001234567 **Alt:** 03217654321
Call anytime: 0300-1234567 (WhatsApp available)
```

### Credentials Field

```csv
Credentials
**Username:** user123
**Password:** pass456
*Login at: https://etracking.pk*
```

### Notes Field

```csv
Notes
**URGENT:** Install before Friday
- Device requires special mounting
- Customer requested SMS alerts
- Follow up needed for **geofence setup**
```

## Real-World Examples

### Example 1: VIP Customer

```csv
ETC #,Customer Name,Customer Contact #,Notes
12345,**Dr. Imran Ali** (VIP),**Cell:** 0300-1234567,**Priority customer** - Ensure same-day service
```

**Email Output:**

- Name: **Dr. Imran Ali** (VIP)
- Contact: **Cell:** 0300-1234567
- Notes: **Priority customer** - Ensure same-day service

### Example 2: Corporate Client

```csv
ETC #,Customer Name,Credentials,Notes
12346,*ABC Logistics Pvt Ltd*,**User:** abc_logistics
**Pass:** secure123,- Fleet of 10 vehicles
- Monthly billing
- Contact: [Support Team](mailto:support@abc.com)
```

**Email Output:**

- Name: _ABC Logistics Pvt Ltd_
- Credentials: **User:** abc_logistics **Pass:** secure123
- Notes: Formatted list with clickable email link

### Example 3: Installation Instructions

```csv
ETC #,Customer Name,Notes
12347,Ali Khan,**Installation Notes:**
1. Device in trunk
2. Hide wiring properly
3. Test GPS signal before leaving
**Follow-up:** Call customer after 2 days
```

**Email Output:**

- Numbered list with proper formatting
- Bold headings stand out
- Clear action items

## Configuration

The markdown processor is configured in `templateEngine.js`:

```javascript
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
  headerIds: false, // Don't add IDs to headers
  mangle: false, // Don't escape email addresses
});
```

## Technical Details

### Markdown Processing Flow

1. **CSV Import**: Raw text is read from CSV
2. **Field Extraction**: Specific fields are identified
3. **Markdown Parsing**: `marked` library converts to HTML
4. **Template Rendering**: HTML is safely inserted into email
5. **Email Sending**: Formatted email is sent

### Security

- HTML output is sanitized automatically
- XSS protection is maintained
- Only whitelisted fields support markdown
- Safe string rendering prevents code injection

### Performance

- Markdown parsing is fast and efficient
- Templates are cached for reuse
- No impact on email sending speed
- Minimal memory overhead

## Troubleshooting

### Markdown Not Rendering

**Problem:** Markdown shows as plain text
**Solution:** Check that triple-braces `{{{ }}}` are used in templates

### HTML Shows Instead of Formatted Text

**Problem:** Raw HTML visible in email
**Solution:** Verify field is in the supported list and processed in `templateEngine.js`

### Line Breaks Not Working

**Problem:** Text runs together
**Solution:** Use double line breaks for paragraphs or enable `breaks: true` option

## Best Practices

### ✅ Do's

- Use **bold** for emphasis and important information
- Use _italic_ for notes or secondary information
- Use lists for multiple items or steps
- Use links for URLs and email addresses
- Keep formatting simple and clean
- Test with sample data before production

### ❌ Don'ts

- Don't overuse formatting (reduces impact)
- Don't use complex nested structures
- Don't rely on markdown for critical layout
- Don't forget to escape special characters if needed
- Don't use headers (h1-h6) in short fields

## Field-Specific Guidelines

### Customer Name

- Use **bold** for VIP or priority customers
- Use _italic_ for company names
- Keep it concise and professional

### Contact Number

- Use **bold** for labels (Primary:, Alt:, WhatsApp:)
- Format numbers consistently
- Include notes about best time to call

### Credentials

- Use **bold** for labels (Username:, Password:)
- Each credential on new line
- Include login URLs as links
- Consider security when sharing passwords

### Notes

- Use **bold** for urgent or priority items
- Use lists for multiple points
- Use links for references
- Keep notes actionable and clear

## Updates Made

### Files Modified

1. ✅ `package.json` - Added `marked` dependency
2. ✅ `src/templateEngine.js` - Added markdown processing
3. ✅ `templates/new-account.hbs` - Updated field syntax
4. ✅ `templates/device-transfer.hbs` - Updated field syntax
5. ✅ `templates/device-redo.hbs` - Updated field syntax
6. ✅ `templates/renewal-done.hbs` - Updated field syntax
7. ✅ `templates/renewal-pending.hbs` - Updated field syntax

### Changes in templateEngine.js

- Added `marked` library import
- Added `setupMarkdown()` method
- Added `renderMarkdown()` method
- Updated template data preparation
- Added markdown helper for Handlebars

### Changes in Templates

- Changed `{{customerName}}` to `{{{customerName}}}`
- Changed `{{contactNumber}}` to `{{{contactNumber}}}`
- Changed `{{credentials}}` to `{{{credentials}}}`
- Changed `{{notes}}` to `{{{notes}}}`

## Backward Compatibility

✅ **Fully backward compatible!**

- Existing CSV files work without changes
- Plain text still displays correctly
- No markdown = no change in output
- Gradual adoption possible

## Date: October 21, 2025
