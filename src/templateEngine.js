const handlebars = require("handlebars");
const fs = require("fs-extra");
const path = require("path");
const { marked } = require("marked");

class TemplateEngine {
  constructor() {
    this.templates = new Map(); // Store multiple templates
    this.setupMarkdown();
    this.registerHelpers();
  }

  setupMarkdown() {
    // Configure marked for inline rendering (no wrapping <p> tags for single lines)
    marked.setOptions({
      breaks: true, // Convert line breaks to <br>
      gfm: true, // GitHub Flavored Markdown
      headerIds: false, // Don't add IDs to headers
      mangle: false, // Don't escape email addresses
    });
  }

  renderMarkdown(text) {
    if (!text || typeof text !== "string") return text || "";

    // Trim the text
    const trimmedText = text.trim();
    if (!trimmedText) return "";

    // Render markdown to HTML
    let html = marked.parse(trimmedText);

    // Remove wrapping <p> tags if it's a single line
    // This keeps inline formatting clean
    html = html.replace(/^<p>(.*)<\/p>\s*$/s, "$1");

    return html;
  }

  async loadTemplate(templatePath) {
    console.log("📄 Loading email template...");

    try {
      const templateContent = await fs.readFile(templatePath, "utf8");
      this.template = handlebars.compile(templateContent);
      console.log("✅ Template loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load template:", error.message);
      throw error;
    }
  }

  async loadTemplateByName(templateName) {
    console.log(`📄 Loading template: ${templateName}`);

    try {
      const templatePath = path.join(
        __dirname,
        "../templates",
        `${templateName}.hbs`
      );
      const templateContent = await fs.readFile(templatePath, "utf8");
      const compiledTemplate = handlebars.compile(templateContent);

      // Cache the compiled template
      this.templates.set(templateName, compiledTemplate);
      console.log(`✅ Template ${templateName} loaded successfully`);

      return compiledTemplate;
    } catch (error) {
      console.error(
        `❌ Failed to load template ${templateName}:`,
        error.message
      );
      throw error;
    }
  }

  async getTemplate(templateName) {
    // Return cached template if available
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName);
    }

    // Load and cache the template
    return await this.loadTemplateByName(templateName);
  }

  async generateEmail(customer) {
    // Get the customer's specific template
    const templateName = customer.emailTemplate || "renewal-pending";
    const template = await this.getTemplate(templateName);

    // Prepare template data
    const templateData = {
      // Customer information (with markdown support)
      customerName: this.renderMarkdown(customer.customerName),
      etcNumber: customer.etcNumber,
      cnic: customer.cnic || "N/A",
      contactNumber: this.renderMarkdown(customer.contactNumber),
      email: customer.email || "N/A",

      // Reference number (AMC format)
      referenceNumber: `ETC2950-${customer.etcNumber}`,

      // Account summary
      totalVehicles: customer.vehicles.length,
      totalDevices: customer.vehicles.length, // Assuming 1 device per vehicle
      totalAmount: this.formatCurrency(customer.totalAmount),

      // New account specific fields (with markdown support)
      installationDate: customer.installationDate || "N/A",
      credentials: customer.credentials
        ? this.renderMarkdown(customer.credentials)
        : null,
      alertMobile: customer.alertMobile || null,
      residentCity: customer.residentCity || null,

      // Additional notes field (with markdown support - only set if exists and has content)
      notes: customer.notes ? this.renderMarkdown(customer.notes) : null,

      // Vehicles list
      vehicles: customer.vehicles.map((vehicle) => ({
        rank: vehicle.rank,
        regNumber: vehicle.regNumber,
        model: vehicle.model,
        package: vehicle.package,
        amount: this.formatCurrency(vehicle.amount),
        startDate: vehicle.startDate,
        endDate: vehicle.endDate,
        tenureLength: vehicle.tenureLength,
      })),

      // Service types (consolidated from all vehicles)
      serviceTypes: this.consolidateServiceTypes(customer.vehicles),

      // Expiry information
      expiryDate: customer.earliestExpiry
        ? this.formatDate(customer.earliestExpiry)
        : "N/A",
      isExpiringSoon: this.isExpiringSoon(customer.earliestExpiry),

      // Current date
      currentDate: this.formatDate(new Date()),

      // Helper functions for template
      helpers: {
        formatCurrency: this.formatCurrency,
        formatDate: this.formatDate,
      },
    };

    try {
      return template(templateData);
    } catch (error) {
      console.error("❌ Error generating email content:", error.message);
      throw error;
    }
  }

  consolidateServiceTypes(vehicles) {
    const serviceTypes = [...new Set(vehicles.map((v) => v.package))].filter(
      Boolean
    );
    return serviceTypes.join(", ") || "Standard Service";
  }

  formatCurrency(amount) {
    if (!amount || isNaN(amount)) return "Rs 0";
    return `Rs ${amount.toLocaleString("en-PK")}`;
  }

  formatDate(date) {
    if (!date) return "N/A";

    // If already a string, try to parse it, otherwise return as-is
    if (typeof date === "string") {
      // Try to parse the string to a Date object
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        // If parsing fails, return the original string
        return date;
      }
      date = parsedDate;
    }

    // Format as DD-MMM-YYYY (e.g., 21-Oct-2025)
    if (date instanceof Date && !isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }

    return date;
  }

  isExpiringSoon(expiryDate, daysThreshold = 30) {
    if (!expiryDate) return false;

    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= daysThreshold;
  }

  // Simple render method for GUI - accepts template name and raw data
  // Preprocesses data to work with existing templates
  async render(templateName, rawData) {
    try {
      // Preprocess data to fill in missing fields
      const data = this.preprocessData(rawData);
      
      const templatePath = path.join(
        __dirname,
        "../templates",
        `${templateName}.hbs`
      );
      const templateContent = await fs.readFile(templatePath, "utf8");
      const compiledTemplate = handlebars.compile(templateContent);
      return compiledTemplate(data);
    } catch (error) {
      console.error(`❌ Failed to render template ${templateName}:`, error.message);
      throw error;
    }
  }

  // Preprocess raw CSV data to work with existing templates
  preprocessData(data) {
    // Use exact column names from the CSV
    const emailValue = data['Send-Email-To'] || "N/A";
    const customerNameValue = data['Customer-Name'] || "Customer";
    const etcNumberValue = data['ETC-number'] || "0000";

    // Create a vehicle object from the CSV data
    const vehicle = {
      rank: data['Vehicle-Rank'] || "1",
      regNumber: data['Vehicle-Reg-number'] || "N/A",
      model: data['Vehicle-Model'] || "N/A",
      package: data['Package-Activated'] || "N/A",
      amount: data['Payment-Amount'] || "N/A",
      startDate: data['Tenure-Start-Date'] || "N/A",
    };

    return {
      // Customer info
      email: emailValue,
      customerName: customerNameValue,
      cnic: data['CNIC'] || "N/A",
      contactNumber: data['Customer-Contact'] || "N/A",
      etcNumber: etcNumberValue,
      
      // Reference info
      referenceNumber: data.referenceNumber || `ETC2950-${etcNumberValue}`,
      
      // Device/vehicle info - create vehicles array from CSV row
      totalDevices: 1,
      totalVehicles: 1,
      vehicles: [vehicle], // Wrap vehicle in array for template iteration
      
      // Amount and dates
      totalAmount: data['Payment-Amount'] || "N/A",
      expiryDate: data['Tenure-Ending-Date'] || "N/A",
      earliestExpiry: data['Tenure-Ending-Date'] || "N/A",
      currentDate: this.formatDate(new Date()),
      
      // Notes
      notes: data['notes'] || null,
      
      // Installation details
      installationDate: data['installation-date'] || null,
      credentials: data['credentials'] || null,
      alertMobile: data['mobile-for-alerts'] || null,
      residentCity: data['geofence-city'] || null,
      
      // Pass through all original data fields
      ...data
    };
  }

  // Find email from various possible column names
  findEmailColumn(data) {
    // Use exact column name from CSV
    return data['Send-Email-To'] || "N/A";
  }

  // Parse vehicles data from various formats
  parseVehicles(vehiclesData) {
    if (!vehiclesData) {
      return [];
    }

    // If it's already an array, return it
    if (Array.isArray(vehiclesData)) {
      return vehiclesData;
    }

    // If it's a JSON string, try to parse it
    if (typeof vehiclesData === 'string') {
      try {
        const parsed = JSON.parse(vehiclesData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // If parsing fails, return empty array
        return [];
      }
    }

    return [];
  }

  // Register custom Handlebars helpers
  registerHelpers() {
    handlebars.registerHelper("formatCurrency", (amount) => {
      return this.formatCurrency(amount);
    });

    handlebars.registerHelper("formatDate", (date) => {
      return this.formatDate(date);
    });

    handlebars.registerHelper("markdown", (text) => {
      return new handlebars.SafeString(this.renderMarkdown(text));
    });

    handlebars.registerHelper("eq", (a, b) => {
      return a === b;
    });

    handlebars.registerHelper("gt", (a, b) => {
      return a > b;
    });

    handlebars.registerHelper("add", (a, b) => {
      return a + b;
    });

    handlebars.registerHelper("json", (context) => {
      return JSON.stringify(context, null, 2);
    });
  }
}

module.exports = TemplateEngine;
