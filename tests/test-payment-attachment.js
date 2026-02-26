const EmailSender = require("./src/emailSender");
const TemplateEngine = require("./src/templateEngine");
require("dotenv").config();

async function testPaymentAttachment() {
  const config = {
    FROM_NAME: process.env.FROM_NAME,
    FROM_EMAIL: process.env.FROM_EMAIL,
    CC_EMAIL: process.env.CC_EMAIL,
    REPLY_TO: process.env.REPLY_TO,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
  };

  const emailSender = new EmailSender(config);
  const templateEngine = new TemplateEngine();

  // Initialize in dry-run mode
  await emailSender.initialize(true);

  // Test data
  const baseCustomer = {
    customerName: "Test Customer",
    email: "test@example.com",
    etcNumber: "1234",
    cnic: "12345-6789012-3",
    contactNumber: "+92 123 456 7890",
    totalAmount: 15000,
    vehicles: [
      {
        rank: 1,
        regNumber: "ABC-123",
        model: "Toyota Corolla",
        package: "Premium Package",
        amount: 15000,
        startDate: "01-Jan-25",
        endDate: "31-Dec-25",
        tenureLength: "12 months",
      },
    ],
    earliestExpiry: new Date("2025-12-31"),
  };

  console.log("🧪 Testing Payment Attachment Logic\n");

  // Test 1: renewal-pending template (should include payment image)
  console.log("📋 Test 1: renewal-pending template");
  const pendingCustomer = { ...baseCustomer, emailTemplate: "renewal-pending" };
  const pendingHtml = await templateEngine.generateEmail(pendingCustomer);
  const pendingResult = await emailSender.sendEmail(
    pendingCustomer,
    pendingHtml,
    true
  );
  console.log("✅ Test 1 completed\n");

  // Test 2: renewal-done template (should NOT include payment image)
  console.log("📋 Test 2: renewal-done template");
  const doneCustomer = { ...baseCustomer, emailTemplate: "renewal-done" };
  const doneHtml = await templateEngine.generateEmail(doneCustomer);
  const doneResult = await emailSender.sendEmail(doneCustomer, doneHtml, true);
  console.log("✅ Test 2 completed\n");

  console.log("📊 Expected Results:");
  console.log(
    '   • renewal-pending: Should show "📎 Would include payment options image"'
  );
  console.log("   • renewal-done: Should NOT show payment image message");
}

testPaymentAttachment().catch(console.error);
