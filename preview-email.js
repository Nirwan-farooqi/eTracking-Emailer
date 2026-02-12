const TemplateEngine = require("./src/templateEngine");
const path = require("path");

async function previewEmail() {
  const templateEngine = new TemplateEngine();

  // Register helpers
  templateEngine.registerHelpers();

  // Load template
  const templatePath = path.join(__dirname, "templates/renewal-template.hbs");
  await templateEngine.loadTemplate(templatePath);

  // Sample customer data
  const sampleCustomer = {
    customerName: "Omer Ahsen Naeem Access Security Pvt Ltd",
    etcNumber: "0055",
    cnic: "35200-0847563-7",
    contactNumber: "923008421288",
    email: "nirwan.farooqi@gmail.com",
    totalAmount: 17500,
    earliestExpiry: new Date("2025-08-12"),
    vehicles: [
      {
        rank: "1",
        regNumber: "AUL-196",
        model: "Suzuki Bolan 2025",
        package: "Gold",
        amount: 3500,
        startDate: "12-Aug-24",
        endDate: "12-Aug-25",
        tenureLength: "1 Year",
      },
      {
        rank: "2",
        regNumber: "LEA-18-7913",
        model: "Suzuki Mehran 2018",
        package: "Gold",
        amount: 7000,
        startDate: "12-Aug-24",
        endDate: "12-Aug-25",
        tenureLength: "1 Year",
      },
      {
        rank: "3",
        regNumber: "CAC-9820",
        model: "Suzuki Ravi 2021",
        package: "Gold",
        amount: 7000,
        startDate: "12-Aug-24",
        endDate: "12-Aug-25",
        tenureLength: "1 Year",
      },
    ],
  };

  try {
    const htmlContent = await templateEngine.generateEmail(sampleCustomer);
    console.log("📧 Generated Email HTML Preview:");
    console.log("=" * 80);
    console.log(htmlContent);
    console.log("=" * 80);

    // Save to file for easy viewing
    const fs = require("fs-extra");
    await fs.writeFile("./email-preview.html", htmlContent);
    console.log("\n✅ Email preview saved to: email-preview.html");
    console.log(
      "💡 Open this file in a web browser to see the formatted email"
    );
  } catch (error) {
    console.error("❌ Error generating email:", error);
  }
}

previewEmail();
