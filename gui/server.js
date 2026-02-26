require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

// Import existing utility classes
const EmailSender = require("../src/emailSender");
const TemplateEngine = require("../src/templateEngine");
const CSVBatchProcessor = require("../src/csvBatchProcessor");

// Initialize Express app
const app = express();
const PORT = process.env.GUI_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Set up multer for file uploads
const uploadDir = path.join(__dirname, "uploads");
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Global state
let emailConfig = null;
let templateEngine = null;
let currentCustomers = [];

/**
 * Initialize email service
 */
async function initializeEmailService() {
  // Always ensure templateEngine is initialized regardless of email config
  if (!templateEngine) {
    templateEngine = new TemplateEngine();
    templateEngine.registerHelpers();
  }

  const requiredVars = [
    "EMAIL_USER",
    "EMAIL_PASS",
    "FROM_NAME",
    "FROM_EMAIL",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    return {
      success: false,
      error: `Missing environment variables: ${missingVars.join(", ")}`,
    };
  }

  emailConfig = {
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    FROM_NAME: process.env.FROM_NAME,
    FROM_EMAIL: process.env.FROM_EMAIL,
    REPLY_TO: process.env.REPLY_TO || process.env.FROM_EMAIL,
    EMAIL_DELAY: parseInt(process.env.EMAIL_DELAY) || 2000,
  };

  return { success: true, config: emailConfig };
}

/**
 * API: Get configuration status
 */
app.get("/api/status", async (req, res) => {
  try {
    const status = await initializeEmailService();
    res.json(status);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * API: Upload and parse CSV file
 */
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // Use CSVBatchProcessor to group rows by ETC number — same as CLI
    const processor = new CSVBatchProcessor();
    await processor.processSingleCSV(req.file.path, req.file.originalname);
    processor.finalizeCustomerTemplates();
    currentCustomers = processor.getCustomersData();

    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      recordCount: currentCustomers.length,
      sampleRecord: currentCustomers[0] || null,
      columns: currentCustomers.length > 0 ? Object.keys(currentCustomers[0]) : [],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * API: Preview email with sample data
 */
app.post("/api/preview", async (req, res) => {
  try {
    const { recordIndex = 0 } = req.body;
    console.log(`📧 Preview requested for record index: ${recordIndex}`);

    if (!templateEngine) {
      await initializeEmailService();
    }

    if (currentCustomers.length === 0) {
      return res.status(400).json({ success: false, error: "No CSV data loaded" });
    }

    if (!currentCustomers[recordIndex]) {
      return res.status(400).json({ success: false, error: `Record index ${recordIndex} not found` });
    }

    const customer = currentCustomers[recordIndex];
    console.log(`   Customer: ${customer.customerName} (${customer.vehicles.length} vehicle(s))`);

    const template = customer.emailTemplate;
    console.log(`   Template: ${template}`);

    const templatePath = path.join(__dirname, "../templates", `${template}.hbs`);

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ success: false, error: `Template '${template}' not found in templates folder` });
    }

    let htmlContent = await templateEngine.generateEmail(customer);
    console.log(`   HTML rendered: ${htmlContent.length} characters`);

    // Replace CID image references with base64 data URLs for browser preview
    const paymentImagePath = path.join(__dirname, "../templates/payment-options.jpeg");
    if (htmlContent.includes('src="cid:payment-options"') && fs.existsSync(paymentImagePath)) {
      const imageData = fs.readFileSync(paymentImagePath).toString('base64');
      htmlContent = htmlContent.replace(
        'src="cid:payment-options"',
        `src="data:image/jpeg;base64,${imageData}"`
      );
    }

    res.json({
      success: true,
      html: htmlContent,
      customer: {
        email: customer.email,
        customerName: customer.customerName,
        etcNumber: customer.etcNumber,
        vehicleCount: customer.vehicles.length,
      },
      template: template,
      recordIndex: recordIndex,
      totalRecords: currentCustomers.length,
    });
  } catch (error) {
    console.error(`❌ Preview error:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * API: Send emails with real-time SSE progress stream
 */
app.get("/api/send-stream", async (req, res) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    const dryRun = req.query.dryRun === "true";
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    if (!templateEngine) {
      await initializeEmailService();
    }

    if (!emailConfig) {
      send({ type: "error", error: "Email not configured. Check .env file." });
      return res.end();
    }

    if (currentCustomers.length === 0) {
      send({ type: "error", error: "No CSV data loaded." });
      return res.end();
    }

    const emailSender = new EmailSender(emailConfig);
    await emailSender.initialize(dryRun);

    let recipients = limit ? currentCustomers.slice(0, limit) : currentCustomers;
    const total = recipients.length;

    send({ type: "start", total });

    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i++) {
      const customer = recipients[i];
      try {
        const template = customer.emailTemplate;
        const templatePath = path.join(__dirname, "../templates", `${template}.hbs`);
        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template '${template}' not found`);
        }

        const htmlContent = await templateEngine.generateEmail(customer);
        const result = await emailSender.sendEmail(customer, htmlContent, dryRun);

        if (result.success) {
          sentCount++;
          send({
            type: "progress",
            index: i + 1,
            total,
            sentCount,
            failedCount,
            status: "success",
            email: customer.email,
            etcNumber: customer.etcNumber,
            customerName: customer.customerName,
            template,
            message: dryRun ? "Dry run - email prepared" : "Email sent successfully",
          });
        } else {
          failedCount++;
          send({
            type: "progress",
            index: i + 1,
            total,
            sentCount,
            failedCount,
            status: "failed",
            email: customer.email,
            etcNumber: customer.etcNumber,
            customerName: customer.customerName,
            template,
            error: result.error,
          });
        }

        await new Promise((resolve) => setTimeout(resolve, emailConfig.EMAIL_DELAY || 1000));
      } catch (error) {
        failedCount++;
        send({
          type: "progress",
          index: i + 1,
          total,
          sentCount,
          failedCount,
          status: "failed",
          email: customer.email || "unknown",
          etcNumber: customer.etcNumber || "unknown",
          customerName: customer.customerName || "unknown",
          template: customer.emailTemplate || "unknown",
          error: error.message,
        });
      }
    }

    send({ type: "done", total, sentCount, failedCount });
    res.end();
  } catch (error) {
    send({ type: "error", error: error.message });
    res.end();
  }
});

/**
 * API: Get current loaded data
 */
app.get("/api/data", (req, res) => {
  res.json({
    success: true,
    recordCount: currentCustomers.length,
    sampleRecords: currentCustomers,
  });
});

/**
 * API: Clear current data
 */
app.post("/api/clear", (req, res) => {
  currentCustomers = [];
  res.json({ success: true, message: "Data cleared" });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ eTracking Email GUI Server Running ✨`);
  console.log(`\n🌐 Open your browser and go to: http://localhost:${PORT}`);
  console.log(`\n📧 Email Config Status:`);
  const requiredVars = ["EMAIL_USER", "EMAIL_PASS", "FROM_NAME", "FROM_EMAIL"];
  requiredVars.forEach((varName) => {
    const isSet = !!process.env[varName];
    console.log(`   ${isSet ? "✅" : "❌"} ${varName}`);
  });
  console.log(
    `\n💡 Make sure to set all email credentials in .env file`
  );
  console.log(`\nPress Ctrl+C to stop the server\n`);
});
