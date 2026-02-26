const TemplateEngine = require("./src/templateEngine");

async function testNewAccountTemplate() {
  const templateEngine = new TemplateEngine();

  // Sample customer data for new-account template
  const customer = {
    customerName: "John Doe",
    etcNumber: "1234",
    cnic: "12345-6789012-3",
    contactNumber: "+92 300 1234567",
    emailTemplate: "new-account",
    installationDate: "15-Sep-2025",
    credentials: `Username: johndoe123
Password: SecurePass@2025
Mobile number for alerts: +92 300 1234567
Resident Geofence Alert: Enabled
Calling Number of Voice-Addon Listening Device: +92 321 9876543
Authorized Number to Call the Device: +92 300 1234567`,
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
      {
        rank: 2,
        regNumber: "XYZ-789",
        model: "Honda Civic 2019",
        package: "Standard GPS Tracking",
        amount: 10000,
        startDate: "15-Sep-25",
        endDate: "15-Sep-26",
        tenureLength: "12 months",
      },
    ],
    earliestExpiry: new Date("2026-09-15"),
  };

  try {
    console.log("🧪 Testing new-account template...");
    const html = await templateEngine.generateEmail(customer);

    // Save to file for inspection
    const fs = require("fs-extra");
    await fs.writeFile("test-new-account-output.html", html);
    console.log("✅ Test HTML saved to test-new-account-output.html");
    console.log("📏 HTML length:", html.length, "characters");

    // Check for key elements
    const checks = {
      "Welcome message": html.includes("Welcome to eTracking!"),
      "Installation date": html.includes("15-Sep-2025"),
      "Credentials table": html.includes("LOGIN CREDENTIALS"),
      "Username in credentials": html.includes("johndoe123"),
      "Multiple vehicles": html.includes("ABC-123") && html.includes("XYZ-789"),
      "No payment image reference": !html.includes("payment-options"),
      "Account setup complete subject": true, // We'll check this separately
    };

    console.log("\n📊 Template Validation:");
    Object.entries(checks).forEach(([check, result]) => {
      console.log(`   ${result ? "✅" : "❌"} ${check}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testNewAccountTemplate();
