const TemplateEngine = require("./src/templateEngine");
const EmailSender = require("./src/emailSender");
require("dotenv").config();

async function testUpdatedNewAccountTemplate() {
  const templateEngine = new TemplateEngine();

  // Sample customer data for new-account template with new fields
  const customer = {
    customerName: "John Doe",
    etcNumber: "1234",
    cnic: "12345-6789012-3",
    contactNumber: "+92 300 1234567",
    emailTemplate: "new-account",
    email: "test@example.com",
    installationDate: "15-Sep-2025",
    credentials: `Username: johndoe123
Password: SecurePass@2025`,
    alertMobile: "+92 300 1234567",
    residentCity: "Karachi",
    totalAmount: 25000,
    vehicles: [
      {
        rank: 1,
        regNumber: "ABC-123",
        model: "Toyota Corolla 2020",
        package: "Premium GPS Tracking",
        amount: 15000,
        startDate: "15-Sep-25",
        endDate: "15-Sep-26",
        tenureLength: "12 months",
      },
    ],
    earliestExpiry: new Date("2026-09-15"),
  };

  try {
    console.log("🧪 Testing updated new-account template...");

    // Test template generation
    const html = await templateEngine.generateEmail(customer);

    // Save to file for inspection
    const fs = require("fs-extra");
    await fs.writeFile("test-updated-new-account.html", html);
    console.log("✅ Test HTML saved to test-updated-new-account.html");

    // Test email subject
    const config = {
      FROM_NAME: process.env.FROM_NAME || "eTracking Team",
      FROM_EMAIL: process.env.FROM_EMAIL || "noreply@etracking.pk",
      CC_EMAIL: process.env.CC_EMAIL || "team@etracking.pk",
    };

    const emailSender = new EmailSender(config);
    await emailSender.initialize(true); // dry run mode

    const result = await emailSender.sendEmail(customer, html, true);

    // Check for key elements
    const checks = {
      "Alert Mobile field":
        html.includes("Mobile number for alerts") &&
        html.includes("+92 300 1234567"),
      "Resident City field":
        html.includes("Resident city for geo fence") &&
        html.includes("Karachi"),
      "Credentials table structure": html.includes(
        "LOGIN CREDENTIALS & SYSTEM ACCESS"
      ),
      "Separate credential rows": html.includes('<td class="label"'),
      "Installation date": html.includes("15-Sep-2025"),
    };

    console.log("\n📊 Template Validation:");
    Object.entries(checks).forEach(([check, result]) => {
      console.log(`   ${result ? "✅" : "❌"} ${check}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testUpdatedNewAccountTemplate();
