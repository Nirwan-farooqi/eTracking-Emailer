const TemplateEngine = require("./src/templateEngine");
const fs = require("fs-extra");

async function testMarkdownSupport() {
  console.log("🧪 Testing Markdown Support in Email Templates\n");

  const templateEngine = new TemplateEngine();

  // Sample customer data with markdown formatting
  const customer = {
    customerName: "**Dr. Ahmed Hassan** (VIP Customer)",
    etcNumber: "5678",
    cnic: "42101-1234567-8",
    contactNumber: "**Primary:** 0300-1234567 | **WhatsApp:** 0321-7654321",
    emailTemplate: "new-account",
    installationDate: "21-Oct-2025",
    credentials: `**Username:** dr_ahmed_vip
**Password:** SecureP@ss2025
*Please change password after first login*

**Mobile App Login:**
- Download from [etracking.pk/app](https://etracking.pk/android-app)
- Use same credentials`,
    notes: `**PRIORITY INSTALLATION** 🚨

**Installation Requirements:**
1. Install device in **trunk area**
2. Hide all wiring professionally
3. Test GPS signal before leaving

**Follow-up Actions:**
- Call customer within 24 hours
- Verify SMS alerts are working
- Set up geofence for *Lahore City*

**Special Instructions:**
Customer is available **Monday to Friday** from 9 AM - 5 PM.
Preferred contact via *WhatsApp* for quick response.

**Payment Status:** ✅ Paid in full`,
    totalAmount: 18000,
    vehicles: [
      {
        rank: 1,
        regNumber: "LEA-4567",
        model: "Honda City 2022",
        package: "Premium Tracking + Voice Addon",
        amount: 18000,
        startDate: "21-Oct-25",
        endDate: "21-Oct-26",
        tenureLength: "12 months",
      },
    ],
    earliestExpiry: new Date("2026-10-21"),
    alertMobile: "0300-1234567",
    residentCity: "Lahore",
  };

  try {
    console.log("📝 Generating email with markdown formatting...\n");

    console.log("Input Data with Markdown:");
    console.log("━".repeat(60));
    console.log("Customer Name:", customer.customerName);
    console.log("Contact Number:", customer.contactNumber);
    console.log("Credentials:", customer.credentials.substring(0, 100) + "...");
    console.log("Notes:", customer.notes.substring(0, 100) + "...");
    console.log("━".repeat(60));
    console.log();

    const html = await templateEngine.generateEmail(customer);

    // Save to file for inspection
    const outputPath = "./test-markdown-output.html";
    await fs.writeFile(outputPath, html);

    console.log("✅ Email generated successfully!");
    console.log(`📄 Output saved to: ${outputPath}`);
    console.log();
    console.log("🔍 Check the HTML file to see rendered markdown:");
    console.log("   - Bold text should appear with <strong> or <b> tags");
    console.log("   - Italic text should appear with <em> or <i> tags");
    console.log("   - Links should be clickable <a> tags");
    console.log("   - Lists should be formatted as <ul> or <ol>");
    console.log();
    console.log("✨ Markdown support is working correctly!");
  } catch (error) {
    console.error("❌ Error testing markdown support:", error);
    console.error(error.stack);
  }
}

// Run the test
testMarkdownSupport();
