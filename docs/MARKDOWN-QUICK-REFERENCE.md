# Quick Reference: Markdown in CSV Fields

## Supported Fields

- `Customer Name` - Customer names with emphasis
- `Customer Contact #` - Contact numbers with labels
- `Credentials` - Login details with formatting
- `Notes` - Installation notes and instructions

## Common Markdown Syntax

### Bold Text

```
**Important Text**
```

Example: `**VIP Customer**` → **VIP Customer**

### Italic Text

```
*Emphasized Text*
```

Example: `*Company Ltd.*` → _Company Ltd._

### Bold + Italic

```
***Very Important***
```

Example: `***URGENT***` → **_URGENT_**

### Links

```
[Link Text](URL)
```

Example: `[Website](https://etracking.pk)` → Clickable link

### Bulleted List

```
- First item
- Second item
- Third item
```

### Numbered List

```
1. First step
2. Second step
3. Third step
```

### Line Break

Use two spaces at end of line or double line break for paragraph

## CSV Examples

### Example 1: Simple Formatting

```csv
ETC #,Customer Name,Customer Contact #,Notes
101,**Ahmed Ali**,**Cell:** 0300-1234567,**Install before:** Friday
102,*XYZ Corp*,0300-7654321,Standard installation
```

### Example 2: VIP Customer

```csv
ETC #,Customer Name,Customer Contact #,Notes
103,**Dr. Imran** (VIP),**Primary:** 0300-111-2222 | **WhatsApp:** 0321-333-4444,**Priority service** - Same day installation required
```

### Example 3: Multiple Contact Methods

```csv
ETC #,Customer Name,Customer Contact #,Credentials
104,Hassan Khan,**Office:** 042-12345678
**Mobile:** 0300-9876543
**Email:** hassan@example.com,**User:** hassan_k
**Pass:** secure123
```

### Example 4: Detailed Notes

```csv
ETC #,Customer Name,Notes
105,Fatima Ahmed,"**Installation Instructions:**

1. Device in trunk
2. Hide all wiring
3. Test GPS signal

**Follow-up:** Call after 2 days"
```

### Example 5: Corporate Client

```csv
ETC #,Customer Name,Customer Contact #,Notes
106,*ABC Logistics Pvt Ltd*,**Manager:** Ali (0300-1111111)
**Accountant:** Sara (0300-2222222),"**Fleet Details:**
- 5 vehicles total
- Monthly billing
- Dedicated support needed

**Contact:** [Email](mailto:fleet@abc.com)"
```

## Field-Specific Tips

### Customer Name

✅ Good:

- `**Dr. Ahmed Ali** (VIP)`
- `*Karachi Transport Ltd.*`
- `**ABC Corp** - Priority`

❌ Avoid:

- Too much formatting
- Long descriptions (keep it concise)

### Customer Contact

✅ Good:

- `**Cell:** 0300-1234567`
- `**Primary:** 0300-111-2222 | **Alt:** 0321-333-4444`
- `**Office:** 042-12345678 | **WhatsApp Available**`

❌ Avoid:

- Unformatted long text
- Missing labels for multiple numbers

### Credentials

✅ Good:

```
**Username:** user123
**Password:** pass456
*Change on first login*
```

❌ Avoid:

- Plain text without structure
- Missing labels

### Notes

✅ Good:

```
**URGENT INSTALLATION**

**Requirements:**
1. Trunk installation
2. Professional wiring
3. GPS testing

**Follow-up:** 24 hours
```

❌ Avoid:

- Wall of text without structure
- Missing priorities or deadlines

## Special Characters & Emojis

You can use emojis in CSV fields:

- 🚨 `**URGENT**` 🚨
- ✅ Completed items
- ⚠️ Warnings
- 📱 Mobile related
- 🔧 Technical/Installation

Example:

```csv
Notes
🚨 **PRIORITY INSTALLATION** 🚨 - Install before weekend ✅
```

## Multi-line Text in CSV

For multi-line content, wrap in quotes:

```csv
ETC #,Notes
107,"**Line 1**
*Line 2*
Line 3"
```

Or use escaped newlines:

```csv
ETC #,Notes
107,**Line 1**\n*Line 2*\nLine 3
```

## Tips for Best Results

1. **Keep it simple** - Don't overuse formatting
2. **Be consistent** - Use same style across all entries
3. **Use bold for emphasis** - Important info stands out
4. **Use italic for notes** - Secondary information
5. **Structure with lists** - Multiple items are clearer
6. **Add emojis sparingly** - For urgent or important items
7. **Test first** - Try on one entry before bulk update

## Common Patterns

### Pattern 1: VIP Customer

```csv
Customer Name: **[Name]** (VIP)
Notes: **Priority service** required
```

### Pattern 2: Corporate Client

```csv
Customer Name: *[Company Name] Ltd.*
Notes: **Fleet:** X vehicles | **Billing:** Monthly
```

### Pattern 3: Urgent Installation

```csv
Notes: 🚨 **URGENT:** Install by [Date]
**Requirements:**
1. [Item 1]
2. [Item 2]
```

### Pattern 4: Multiple Contacts

```csv
Customer Contact #: **Primary:** [Number] | **Alt:** [Number] | **WhatsApp:** [Number]
```

### Pattern 5: Structured Credentials

```csv
Credentials: **Username:** [user]
**Password:** [pass]
*[Instructions]*

**App:** [link]
```

## Testing Your CSV

Before sending emails:

1. Add markdown to one customer
2. Run test: `node test-markdown-support.js`
3. Check generated HTML
4. Verify formatting looks good
5. Apply to all customers

## Need Help?

Refer to:

- `MARKDOWN-SUPPORT.md` - Complete documentation
- `test-markdown-support.js` - Working examples
- Generated `test-markdown-output.html` - See rendered output

---

**Quick Tip:** Start simple with just **bold** for important info, then gradually add more formatting as needed!
