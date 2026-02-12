require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const csv = require("csv-parser");

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

  if (!templateEngine) {
    templateEngine = new TemplateEngine();
    templateEngine.registerHelpers();
  }

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

    const filePath = req.file.path;
    const customers = [];

    // Parse CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        customers.push(row);
      })
      .on("end", () => {
        currentCustomers = customers;
        res.json({
          success: true,
          filename: req.file.filename,
          originalName: req.file.originalname,
          recordCount: customers.length,
          sampleRecord: customers[0],
          columns: customers.length > 0 ? Object.keys(customers[0]) : [],
        });
      })
      .on("error", (error) => {
        res.status(400).json({ success: false, error: error.message });
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

    const rawCustomer = currentCustomers[recordIndex];
    console.log(`   Customer: ${rawCustomer['Customer-Name']}`);

    // Preprocess raw CSV data to match template engine expectations (same as /api/send)
    const customer = {
      email: rawCustomer['Send-Email-To'] || rawCustomer.email || "N/A",
      customerName: rawCustomer['Customer-Name'] || rawCustomer.customerName || "Customer",
      etcNumber: rawCustomer['ETC-number'] || rawCustomer.etcNumber || "0000",
      cnic: rawCustomer['CNIC'] || rawCustomer.cnic || "N/A",
      contactNumber: rawCustomer['Customer-Contact'] || rawCustomer.contactNumber || "N/A",
      totalAmount: rawCustomer['Payment-Amount'] || rawCustomer.totalAmount || "N/A",
      expiryDate: rawCustomer['Tenure-Ending-Date'] || rawCustomer.expiryDate || "N/A",
      installationDate: rawCustomer['installation-date'] || rawCustomer.installationDate || null,
      credentials: rawCustomer['credentials'] || rawCustomer.credentials || null,
      alertMobile: rawCustomer['mobile-for-alerts'] || rawCustomer.alertMobile || null,
      residentCity: rawCustomer['geofence-city'] || rawCustomer.residentCity || null,
      emailTemplate: rawCustomer["email-template"] || rawCustomer["emailTemplate"] || "renewal-pending",
      notes: rawCustomer['notes'] || rawCustomer.notes || null,
      ...rawCustomer // Include all original fields for template compatibility
    };

    const template = customer.emailTemplate;
    console.log(`   Template: ${template}`);

    const templatePath = path.join(__dirname, "../templates", `${template}.hbs`);

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ success: false, error: `Template '${template}' not found in templates folder` });
    }

    const htmlContent = await templateEngine.render(template, customer);
    console.log(`   HTML rendered: ${htmlContent.length} characters`);

    res.json({
      success: true,
      html: htmlContent,
      customer: {
        email: customer.email,
        customerName: customer.customerName,
        etcNumber: customer.etcNumber,
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
 * API: Send emails
 */
app.post("/api/send", async (req, res) => {
  try {
    const { dryRun = false, limit = null } = req.body;

    if (!templateEngine) {
      await initializeEmailService();
    }

    if (!emailConfig) {
      return res.status(400).json({ success: false, error: "Email not configured" });
    }

    const emailSender = new EmailSender(emailConfig);
    await emailSender.initialize(dryRun);

    let recipients = currentCustomers;
    if (limit) {
      recipients = recipients.slice(0, limit);
    }

    const results = {
      success: [],
      failed: [],
      total: recipients.length,
    };

    for (let i = 0; i < recipients.length; i++) {
      try {
        const rawCustomer = recipients[i];

        // Preprocess raw CSV data to match template engine expectations
        const customer = {
          email: rawCustomer['Send-Email-To'] || rawCustomer.email || "N/A",
          customerName: rawCustomer['Customer-Name'] || rawCustomer.customerName || "Customer",
          etcNumber: rawCustomer['ETC-number'] || rawCustomer.etcNumber || "0000",
          cnic: rawCustomer['CNIC'] || rawCustomer.cnic || "N/A",
          contactNumber: rawCustomer['Customer-Contact'] || rawCustomer.contactNumber || "N/A",
          totalAmount: rawCustomer['Payment-Amount'] || rawCustomer.totalAmount || "N/A",
          expiryDate: rawCustomer['Tenure-Ending-Date'] || rawCustomer.expiryDate || "N/A",
          installationDate: rawCustomer['installation-date'] || rawCustomer.installationDate || null,
          credentials: rawCustomer['credentials'] || rawCustomer.credentials || null,
          alertMobile: rawCustomer['mobile-for-alerts'] || rawCustomer.alertMobile || null,
          residentCity: rawCustomer['geofence-city'] || rawCustomer.residentCity || null,
          emailTemplate: rawCustomer["email-template"] || rawCustomer["emailTemplate"] || "renewal-pending",
          notes: rawCustomer['notes'] || rawCustomer.notes || null,
          ...rawCustomer // Include all original fields for template compatibility
        };

        const template = customer.emailTemplate;

        const templatePath = path.join(__dirname, "../templates", `${template}.hbs`);
        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template '${template}' not found`);
        }

        const htmlContent = await templateEngine.render(template, customer);

        // Use the proper emailSender.sendEmail method to match "npm start" behavior
        const result = await emailSender.sendEmail(customer, htmlContent, dryRun);

        if (result.success) {
          results.success.push({
            email: customer.email,
            template: template,
            message: dryRun ? "Dry run - email prepared" : "Email sent successfully",
            messageId: result.messageId,
          });
        } else {
          results.failed.push({
            email: customer.email,
            template: template,
            error: result.error,
          });
        }

        // Add delay between emails
        await new Promise((resolve) =>
          setTimeout(resolve, emailConfig.EMAIL_DELAY || 1000)
        );
      } catch (error) {
        const email = recipients[i]['Send-Email-To'] || recipients[i].email || 'unknown';
        const template = recipients[i]["email-template"] || recipients[i]["emailTemplate"] || "unknown";
        results.failed.push({
          email: email,
          template: template,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      mode: dryRun ? "DRY-RUN" : "PRODUCTION",
      results: results,
      summary: {
        total: results.total,
        sent: results.success.length,
        failed: results.failed.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
