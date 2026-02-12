const TemplateEngine = require("./src/templateEngine");

async function testCredentialsTableDesign() {
  const templateEngine = new TemplateEngine();

  // Sample customer data for new-account template with new fields
  const customer = {
    customerName: "John Doe",
    etcNumber: "1234",
    cnic: "12345-6789012-3",
    contactNumber: "+92 300 1234567",
    emailTemplate: "new-account",
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
    console.log("🧪 Testing credentials table design consistency...");
    const html = await templateEngine.generateEmail(customer);

    // Save to file for inspection
    const fs = require("fs-extra");
    await fs.writeFile("test-table-design.html", html);
    console.log("✅ Test HTML saved to test-table-design.html");

    // Check for consistent styling
    const checks = {
      "Green header in credentials table":
        html.includes("background-color: #00aa00") &&
        html.includes("LOGIN CREDENTIALS"),
      "Label class in credentials": html.includes(
        '<td class="label">Login Credentials</td>'
      ),
      "Value class in credentials": html.includes('<td class="value">'),
      "Alert Mobile with proper classes": html.includes(
        '<td class="label">Mobile number for alerts</td>'
      ),
      "Resident City with proper classes": html.includes(
        '<td class="label">Resident city for geo fence</td>'
      ),
      "White-space pre-line for credentials": html.includes(
        'style="white-space: pre-line;">'
      ),
    };

    console.log("\n📊 Table Design Consistency Check:");
    Object.entries(checks).forEach(([check, result]) => {
      console.log(`   ${result ? "✅" : "❌"} ${check}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testCredentialsTableDesign();
