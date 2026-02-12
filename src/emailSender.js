const nodemailer = require("nodemailer");
const fs = require("fs-extra");
const path = require("path");

class EmailSender {
  constructor(config) {
    this.config = config;
    this.transporter = null;
    this.sentCount = 0;
    this.failedCount = 0;
    this.logFile = path.join(__dirname, "../logs/email-log.txt");
  }

  async initialize(isDryRun = false) {
    console.log("📧 Initializing email service...");

    // Skip email initialization in dry-run mode
    if (isDryRun) {
      console.log("📋 Dry-run mode: Skipping email service initialization");

      // Ensure log file exists
      await fs.ensureFile(this.logFile);
      return;
    }

    try {
      // Create transporter based on configuration
      if (this.config.EMAIL_SERVICE === "gmail") {
        this.transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: this.config.EMAIL_USER,
            pass: this.config.EMAIL_PASS,
          },
        });
      } else if (this.config.SMTP_HOST) {
        this.transporter = nodemailer.createTransport({
          host: this.config.SMTP_HOST,
          port: this.config.SMTP_PORT || 587,
          secure: this.config.SMTP_SECURE === "true",
          auth: {
            user: this.config.EMAIL_USER,
            pass: this.config.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      } else {
        throw new Error("No email service configuration found");
      }

      // Verify connection
      await this.transporter.verify();
      console.log("✅ Email service connected successfully");

      // Ensure log file exists
      await fs.ensureFile(this.logFile);
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error.message);
      throw error;
    }
  }

  async sendEmail(customer, htmlContent, isDryRun = false) {
    // Dynamic subject based on template using .env file
    const getSubjectFromEnv = (templateName, etcNumber) => {
      const envKey = `email-title-${templateName}`;
      const envTitle = process.env[envKey];

      if (envTitle) {
        return `${envTitle} - ETC2950-${etcNumber}`;
      }

      // Fallback to hardcoded subjects if env not found
      const fallbackSubjects = {
        "renewal-pending": `Vehicle Tracking Service Renewal Reminder - ETC #${etcNumber}`,
        "renewal-done": `Vehicle Tracking Service Renewal Confirmation - ETC #${etcNumber}`,
        "new-account": `Welcome to eTracking - Your Account Setup Complete - ETC #${etcNumber}`,
        "device-transfer": `eTracking Device Transfer Completed Successfully - ETC #${etcNumber}`,
        "device-redo": `eTracking Device Reinstallation Completed Successfully - ETC #${etcNumber}`,
        "device-addition": `New Device Successfully Added to Your eTracking Account - ETC #${etcNumber}`,
      };

      return (
        fallbackSubjects[templateName] || fallbackSubjects["renewal-pending"]
      );
    };

    // Validate template exists
    if (!customer.emailTemplate) {
      const error = `Email template not set for customer ${customer.customerName} (ETC: ${customer.etcNumber}). This should have been caught during CSV processing.`;
      console.error("❌", error);
      await this.logEmail(customer, "FAILED", error);
      this.failedCount++;
      return { success: false, error };
    }

    const subject = getSubjectFromEnv(
      customer.emailTemplate,
      customer.etcNumber
    );

    if (!customer.email) {
      const error = `No email address for customer ${customer.customerName} (ETC: ${customer.etcNumber})`;
      console.warn("⚠️ ", error);
      await this.logEmail(customer, "FAILED", error);
      this.failedCount++;
      return { success: false, error };
    }

    // Prepare payment options image attachment (only for renewal-pending template)
    const paymentImagePath = path.join(
      __dirname,
      "../templates/payment-options.jpeg"
    );

    // Base mail options
    const mailOptions = {
      from: `${this.config.FROM_NAME} <${this.config.FROM_EMAIL}>`,
      to: customer.email,
      cc: this.config.CC_EMAIL || "team@etracking.pk",
      replyTo: this.config.REPLY_TO,
      subject: subject,
      html: htmlContent,
      // Add text version for better compatibility
      text: this.htmlToText(htmlContent),
    };

    // Only include payment image attachment for renewal-pending template
    const templateName = customer.emailTemplate || "renewal-pending";
    if (templateName === "renewal-pending") {
      mailOptions.attachments = [
        {
          filename: "payment-options.jpeg",
          path: paymentImagePath,
          cid: "payment-options", // Content ID for embedding in HTML
        },
      ];
    }

    if (isDryRun) {
      console.log(`📋 [DRY RUN] Would send email to: ${customer.email}`);
      console.log(`   CC: ${this.config.CC_EMAIL || "team@etracking.pk"}`);
      console.log(
        `   Template: ${customer.emailTemplate || "renewal-pending"}`
      );
      console.log(`   Subject: ${subject}`);

      // Only mention payment image for renewal-pending template
      if (templateName === "renewal-pending") {
        console.log(`   📎 Would include payment options image`);
      }

      // Save HTML to output folder in dry-run mode for preview
      const outputPath = path.join(
        __dirname,
        "../output",
        `${customer.etcNumber}-${templateName}-preview.html`
      );
      await fs.writeFile(outputPath, htmlContent);
      console.log(
        `   💾 Preview saved: output/${customer.etcNumber}-${templateName}-preview.html`
      );

      await this.logEmail(
        customer,
        "DRY_RUN",
        "Email prepared but not sent (dry run mode)"
      );
      return { success: true, isDryRun: true };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Email sent to ${customer.customerName} (${customer.email})`
      );

      await this.logEmail(customer, "SUCCESS", `Message ID: ${info.messageId}`);
      this.sentCount++;

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(
        `❌ Failed to send email to ${customer.email}:`,
        error.message
      );

      await this.logEmail(customer, "FAILED", error.message);
      this.failedCount++;

      return { success: false, error: error.message };
    }
  }

  async sendBulkEmails(
    customers,
    templateEngine,
    isDryRun = false,
    delay = 2000
  ) {
    console.log(
      `\n📬 Starting bulk email send (${isDryRun ? "DRY RUN" : "LIVE"})...`
    );
    console.log(`📊 Total customers: ${customers.length}`);
    console.log(`⏱️  Delay between emails: ${delay}ms\n`);

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];

      console.log(
        `📧 Processing ${i + 1}/${customers.length}: ${
          customer.customerName
        } (ETC: ${customer.etcNumber}) [Template: ${
          customer.emailTemplate || "renewal-pending"
        }]`
      );

      try {
        // Generate personalized email content
        const htmlContent = await templateEngine.generateEmail(customer);

        // Send email
        const result = await this.sendEmail(customer, htmlContent, isDryRun);

        if (!result.success) {
          console.log(`   ❌ Failed: ${result.error}`);
        } else if (result.isDryRun) {
          console.log(`   📋 Dry run completed`);
        } else {
          console.log(`   ✅ Sent successfully`);
        }
      } catch (error) {
        console.error(`   ❌ Error processing customer:`, error.message);
        await this.logEmail(customer, "ERROR", error.message);
        this.failedCount++;
      }

      // Add delay between emails (except for last email)
      if (i < customers.length - 1 && !isDryRun) {
        await this.delay(delay);
      }
    }

    console.log(`\n📊 Bulk email summary:`);
    console.log(`   ✅ Successful: ${this.sentCount}`);
    console.log(`   ❌ Failed: ${this.failedCount}`);
    console.log(`   📋 Total processed: ${customers.length}`);
  }

  async logEmail(customer, status, details = "") {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | ${status} | ETC: ${customer.etcNumber} | ${customer.customerName} | ${customer.email} | ${details}\n`;

    try {
      await fs.appendFile(this.logFile, logEntry);
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  htmlToText(html) {
    // Simple HTML to text conversion
    return html
      .replace(/<br[^>]*>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      sent: this.sentCount,
      failed: this.failedCount,
      total: this.sentCount + this.failedCount,
    };
  }
}

module.exports = EmailSender;
