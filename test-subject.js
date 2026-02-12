const EmailSender = require("./src/emailSender");
require("dotenv").config();

async function testNewAccountSubject() {
  const config = {
    FROM_NAME: process.env.FROM_NAME || "eTracking Team",
    FROM_EMAIL: process.env.FROM_EMAIL || "noreply@etracking.pk",
    CC_EMAIL: process.env.CC_EMAIL || "team@etracking.pk",
  };

  const emailSender = new EmailSender(config);
  await emailSender.initialize(true); // dry run mode

  const customer = {
    etcNumber: "1234",
    emailTemplate: "new-account",
    email: "test@example.com",
  };

  console.log("🧪 Testing new-account email subject...");

  try {
    const result = await emailSender.sendEmail(
      customer,
      "<html>Test content</html>",
      true
    );
    console.log("✅ Email subject test completed successfully");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testNewAccountSubject();
