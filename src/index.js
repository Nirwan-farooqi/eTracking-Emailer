require("dotenv").config();
const yargs = require("yargs");
const path = require("path");

const CSVBatchProcessor = require("./csvBatchProcessor");
const EmailSender = require("./emailSender");
const TemplateEngine = require("./templateEngine");

class EmailUtility {
  constructor() {
    this.csvProcessor = new CSVBatchProcessor();
    this.emailSender = null;
    this.templateEngine = new TemplateEngine();
  }

  async initialize(isDryRun = false) {
    console.log("🚀 Initializing eTracking Email Utility...\n");

    // Load configuration
    const config = this.loadConfig(isDryRun);

    // Initialize email sender
    this.emailSender = new EmailSender(config);
    await this.emailSender.initialize(isDryRun);

    // Register template helpers
    this.templateEngine.registerHelpers();

    // Note: Templates will be loaded dynamically based on customer data
    // No need to preload a specific template

    console.log("✅ Initialization complete!\n");
  }

  loadConfig(isDryRun = false) {
    // In dry-run mode, skip validation of email credentials
    if (isDryRun) {
      return {
        EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
        EMAIL_USER: process.env.EMAIL_USER || "demo@example.com",
        EMAIL_PASS: process.env.EMAIL_PASS || "demo-password",
        FROM_NAME: process.env.FROM_NAME || "eTracking Support",
        FROM_EMAIL: process.env.FROM_EMAIL || "demo@example.com",
        REPLY_TO: process.env.REPLY_TO || "info@etracking.pk",
        EMAIL_DELAY: parseInt(process.env.EMAIL_DELAY) || 2000,
      };
    }

    const requiredVars = [
      "EMAIL_USER",
      "EMAIL_PASS",
      "FROM_NAME",
      "FROM_EMAIL",
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error("❌ Missing required environment variables:");
      missingVars.forEach((varName) => console.error(`   - ${varName}`));
      console.error(
        "\n💡 Please copy .env.example to .env and fill in your email credentials."
      );
      process.exit(1);
    }

    return {
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
  }

  async run(options) {
    try {
      // Process CSV files from customers folder
      const customersFolder =
        options.folder || path.join(__dirname, "../customers");
      const processedFolder = path.join(__dirname, "../processed");

      await this.csvProcessor.processCSVFolder(
        customersFolder,
        processedFolder
      );

      // Get customers data
      let customers = this.csvProcessor.getCustomersData();

      // Apply filters
      customers = this.applyFilters(customers, options);

      if (customers.length === 0) {
        console.log("📭 No customers match the specified criteria.");
        return;
      }

      // Show processing summary
      const summary = this.csvProcessor.getProcessingSummary();
      console.log(`\n📋 Processing Summary:`);
      console.log(`   📄 Files processed: ${summary.filesProcessed}`);
      console.log(`   👥 Total unique customers: ${summary.totalCustomers}`);
      console.log(`   📧 Customers to email: ${customers.length}`);

      // Show preview
      this.showPreview(customers, options);

      // Confirm before sending (unless in dry-run mode)
      if (!options.dryRun && !options.yes) {
        const confirmed = await this.confirmSend(customers.length);
        if (!confirmed) {
          console.log("❌ Email sending cancelled by user.");
          return;
        }
      }

      // Send emails
      await this.emailSender.sendBulkEmails(
        customers,
        this.templateEngine,
        options.dryRun,
        options.delay || 2000
      );

      // Move processed files (only if emails were actually sent or it's a dry run)
      if (options.dryRun || !options.dryRun) {
        await this.csvProcessor.moveProcessedFiles(processedFolder);
      }

      // Show final stats
      const stats = this.emailSender.getStats();
      console.log("\n📊 Final Statistics:");
      console.log(`   ✅ Emails sent: ${stats.sent}`);
      console.log(`   ❌ Failed: ${stats.failed}`);
      console.log(`   📧 Total processed: ${stats.total}`);

      if (stats.failed > 0) {
        console.log(`\n📋 Check logs for details: logs/email-log.txt`);
      }
    } catch (error) {
      console.error("💥 Fatal error:", error.message);
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  }

  applyFilters(customers, options) {
    let filtered = customers;

    // Filter by ETC numbers
    if (options.etc && options.etc.length > 0) {
      // Convert ETC numbers to strings for comparison
      const etcSet = new Set(options.etc.map((etc) => String(etc)));
      filtered = filtered.filter((customer) =>
        etcSet.has(String(customer.etcNumber))
      );
      console.log(`🔍 Filtered by ETC numbers: ${filtered.length} customers`);
    }

    // Filter by expiry date
    if (options.expiry) {
      const daysFromNow = parseInt(options.expiry);
      filtered = this.csvProcessor.filterByExpiryDate.call(
        {
          getCustomersData: () => filtered,
          customers: new Map(filtered.map((c) => [c.etcNumber, c])),
        },
        daysFromNow
      );
      console.log(
        `🔍 Filtered by expiry (${daysFromNow} days): ${filtered.length} customers`
      );
    }

    // Filter by package type
    if (options.package) {
      filtered = filtered.filter((customer) =>
        customer.vehicles.some((vehicle) =>
          vehicle.package.toLowerCase().includes(options.package.toLowerCase())
        )
      );
      console.log(
        `🔍 Filtered by package type '${options.package}': ${filtered.length} customers`
      );
    }

    // Limit results
    if (options.limit) {
      filtered = filtered.slice(0, parseInt(options.limit));
      console.log(`🔍 Limited to ${filtered.length} customers`);
    }

    return filtered;
  }

  showPreview(customers, options) {
    console.log(
      `\n📋 Email Preview (${options.dryRun ? "DRY RUN" : "LIVE MODE"}):`
    );
    console.log("─".repeat(60));

    customers.slice(0, 5).forEach((customer, index) => {
      console.log(
        `${index + 1}. ${customer.customerName} (ETC: ${customer.etcNumber})`
      );
      console.log(`   📧 Email: ${customer.email || "NO EMAIL"}`);
      console.log(`   🚗 Vehicles: ${customer.vehicles.length}`);
      console.log(`   💰 Total: Rs ${customer.totalAmount.toLocaleString()}`);
      console.log(
        `   📅 Expires: ${
          customer.earliestExpiry
            ? customer.earliestExpiry.toDateString()
            : "N/A"
        }`
      );
      if (customer.sourceFiles && customer.sourceFiles.length > 0) {
        console.log(`   📄 Source: ${customer.sourceFiles.join(", ")}`);
      }
      console.log("");
    });

    if (customers.length > 5) {
      console.log(`   ... and ${customers.length - 5} more customers`);
    }
    console.log("─".repeat(60));
  }

  async confirmSend(count) {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      readline.question(
        `\n❓ Send emails to ${count} customers? (yes/no): `,
        (answer) => {
          readline.close();
          resolve(answer.toLowerCase().startsWith("y"));
        }
      );
    });
  }
}

// CLI Setup
const argv = yargs
  .usage("Usage: $0 [options]")
  .option("folder", {
    type: "string",
    description: "Path to customers folder containing CSV files",
    default: "./customers",
  })
  .option("dry-run", {
    type: "boolean",
    description: "Preview emails without sending",
    default: false,
  })
  .option("etc", {
    type: "array",
    description: "Filter by specific ETC numbers",
    default: [],
  })
  .option("expiry", {
    type: "number",
    description: "Filter by expiry within N days",
  })
  .option("package", {
    type: "string",
    description: "Filter by package type (Gold, Platinum, etc.)",
  })
  .option("limit", {
    type: "number",
    description: "Limit number of emails to send",
  })
  .option("delay", {
    type: "number",
    description: "Delay between emails in milliseconds",
    default: 2000,
  })
  .option("yes", {
    type: "boolean",
    description: "Skip confirmation prompt",
    default: false,
  })
  .option("verbose", {
    type: "boolean",
    description: "Show detailed error messages",
    default: false,
  })
  .help()
  .alias("h", "help")
  .example(
    "$0 --dry-run",
    "Preview emails from all CSV files in customers folder"
  )
  .example("$0 --etc 0055 0221", "Send emails to specific ETC numbers")
  .example("$0 --expiry 7", "Send to customers expiring within 7 days")
  .example(
    "$0 --package Gold --limit 10",
    "Send to first 10 Gold package customers"
  )
  .example(
    "$0 --folder ./my-customers",
    "Process CSV files from custom folder"
  ).argv;

// Main execution
async function main() {
  const utility = new EmailUtility();

  try {
    await utility.initialize(argv.dryRun);
    await utility.run(argv);
  } catch (error) {
    console.error("💥 Application failed to start:", error.message);
    if (argv.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = EmailUtility;
