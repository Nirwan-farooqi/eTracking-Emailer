const fs = require("fs-extra");
const csv = require("csv-parser");
const path = require("path");
const crypto = require("crypto");

class CSVBatchProcessor {
  constructor() {
    this.allCustomers = new Map();
    this.processedFiles = [];
    this.fileHashes = new Map();
    this.processedFileHashes = new Map();
  }

  async computeFileHash(filePath) {
    const fileContent = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(fileContent).digest("hex");
  }

  async loadProcessedFileHashes(processedFolderPath) {
    try {
      const hashLogFile = path.join(processedFolderPath, ".processed-hashes.json");
      if (await fs.pathExists(hashLogFile)) {
        const content = await fs.readFile(hashLogFile, "utf-8");
        this.processedFileHashes = new Map(Object.entries(JSON.parse(content)));
      }
    } catch (error) {
      console.warn("⚠️  Could not load processed file hashes:", error.message);
    }
  }

  async saveProcessedFileHashes(processedFolderPath) {
    try {
      const hashLogFile = path.join(processedFolderPath, ".processed-hashes.json");
      const hashObj = Object.fromEntries(this.processedFileHashes);
      await fs.writeFile(hashLogFile, JSON.stringify(hashObj, null, 2), "utf-8");
    } catch (error) {
      console.error("❌ Could not save processed file hashes:", error.message);
    }
  }

  async processCSVFolder(folderPath, processedFolderPath) {
    console.log("📂 Scanning for CSV files in customers folder...");

    // Ensure processed folder exists
    await fs.ensureDir(processedFolderPath);
    
    // Load previously processed file hashes
    await this.loadProcessedFileHashes(processedFolderPath);

    // Get all CSV files in the folder
    const files = await fs.readdir(folderPath);
    const csvFiles = files.filter(
      (file) => file.toLowerCase().endsWith(".csv") && !file.startsWith(".") // Skip hidden files
    );

    if (csvFiles.length === 0) {
      console.log("📭 No CSV files found in customers folder");
      return this.allCustomers;
    }

    console.log(`📊 Found ${csvFiles.length} CSV file(s) to process:`);
    csvFiles.forEach((file) => console.log(`   • ${file}`));
    console.log("");

    // Process each CSV file
    for (const csvFile of csvFiles) {
      const csvPath = path.join(folderPath, csvFile);
      
      try {
        const fileHash = await this.computeFileHash(csvPath);
        this.fileHashes.set(csvFile, fileHash);
        
        if (this.processedFileHashes.has(csvFile)) {
          const previousHash = this.processedFileHashes.get(csvFile);
          if (previousHash === fileHash) {
            console.warn(`⚠️  ${csvFile} - Already processed (identical file). Skipping.`);
            continue;
          } else {
            console.warn(`⚠️  ${csvFile} - Same filename but DIFFERENT data detected!`);
            console.warn(`   🔄 This will be processed as NEW data.`);
          }
        }
        
        await this.processSingleCSV(csvPath, csvFile);
      } catch (error) {
        console.error(`❌ Error with ${csvFile}:`, error.message);
      }
    }

    // Finalize email templates for all customers
    this.finalizeCustomerTemplates();

    console.log(
      `✅ Processed ${csvFiles.length} CSV file(s) with ${this.allCustomers.size} unique customers`
    );
    return this.allCustomers;
  }

  async processSingleCSV(csvFilePath, fileName) {
    console.log(`📄 Processing: ${fileName}`);

    return new Promise(async (resolve, reject) => {
      const results = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (row) => {
          results.push(row);
        })
        .on("end", async () => {
          console.log(`   ✅ Read ${results.length} rows from ${fileName}`);
          
          // Standardize dates and rewrite CSV
          try {
            const correctedResults = this.standardizeDatesInRows(results);
            await this.rewriteCSVFile(csvFilePath, correctedResults);
            console.log(`   📅 Date format standardized and CSV updated`);
          } catch (error) {
            console.error(`   ⚠️  Could not rewrite CSV file:`, error.message);
          }
          
          this.groupCustomersByETC(results, fileName);
          this.processedFiles.push({
            fileName,
            filePath: csvFilePath,
            rowCount: results.length,
            processedAt: new Date(),
          });
          resolve();
        })
        .on("error", (error) => {
          console.error(`   ❌ Error processing ${fileName}:`, error);
          reject(error);
        });
    });
  }

  async moveProcessedFiles(processedFolderPath) {
    console.log("\n📁 Moving processed files...");

    for (const fileInfo of this.processedFiles) {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const newFileName = `${timestamp}_${fileInfo.fileName}`;
        const newPath = path.join(processedFolderPath, newFileName);

        await fs.move(fileInfo.filePath, newPath);
        console.log(
          `   ✅ Moved: ${fileInfo.fileName} → processed/${newFileName}`
        );
        
        if (this.fileHashes.has(fileInfo.fileName)) {
          this.processedFileHashes.set(fileInfo.fileName, this.fileHashes.get(fileInfo.fileName));
        }
      } catch (error) {
        console.error(
          `   ❌ Failed to move ${fileInfo.fileName}:`,
          error.message
        );
      }
    }
    
    await this.saveProcessedFileHashes(processedFolderPath);
  }

  groupCustomersByETC(rows, sourceFile) {
    rows.forEach((row) => {
      const etcNumber =
        row["ETC-number"] || row["ETC\n#"] || row["ETC #"] || row.ETC;

      if (!etcNumber) {
        console.warn(`   ⚠️  Row missing ETC number in ${sourceFile}:`, row);
        return;
      }

      if (!this.allCustomers.has(etcNumber)) {
        this.allCustomers.set(etcNumber, {
          etcNumber,
          customerName:
            row["Customer-Name"] ||
            row["Customer Name"] ||
            row.customerName ||
            "",
          contactNumber:
            row["Customer-Contact"] ||
            row["Customer\nContact #"] ||
            row["Customer Contact #"] ||
            row.contactNumber ||
            "",
          cnic: row["CNIC"] || row["CNIC no."] || row.cnic || "",
          email: this.extractEmail(row),
          // New account specific fields
          installationDate:
            row["installation-date"] ||
            row["Installation Date"] ||
            row.installationDate ||
            "",
          credentials:
            row["credentials"] || row["Credentials"] || row.credentials || "",
          alertMobile:
            row["mobile-for-alerts"] ||
            row["Alert Mobile"] ||
            row["Mobile number for alerts"] ||
            row.alertMobile ||
            "",
          residentCity:
            row["resident-city"] ||
            row["geofence-city"] ||
            row["Resident city for geo fence"] ||
            row.residentCity ||
            "",
          // Notes field with markdown support
          notes: (() => {
            const notesRaw = row["notes"] || row["Notes"] || row["NOTES"] || "";
            const notesTrimmed = notesRaw.trim();
            return notesTrimmed || null;
          })(),
          vehicles: [],
          totalAmount: 0,
          earliestExpiry: null,
          emailTemplate: null, // Will be determined after all vehicles are processed
          sourceFiles: new Set([sourceFile]), // Track which files this customer came from
        });
      } else {
        // Add source file to existing customer
        this.allCustomers.get(etcNumber).sourceFiles.add(sourceFile);

        // Update new account fields if they exist in this row and weren't set before
        const customer = this.allCustomers.get(etcNumber);
        if (
          !customer.installationDate &&
          (row["installation-date"] ||
            row["Installation Date"] ||
            row.installationDate)
        ) {
          customer.installationDate =
            row["installation-date"] ||
            row["Installation Date"] ||
            row.installationDate ||
            "";
        }
        if (
          !customer.credentials &&
          (row["credentials"] || row["Credentials"] || row.credentials)
        ) {
          customer.credentials =
            row["credentials"] || row["Credentials"] || row.credentials || "";
        }
        if (
          !customer.alertMobile &&
          (row["alert-mobile"] ||
            row["Alert Mobile"] ||
            row["Mobile number for alerts"] ||
            row.alertMobile)
        ) {
          customer.alertMobile =
            row["alert-mobile"] ||
            row["Alert Mobile"] ||
            row["Mobile number for alerts"] ||
            row.alertMobile ||
            "";
        }
        if (
          !customer.residentCity &&
          (row["resident-city"] ||
            row["Resident City"] ||
            row["Resident city for geo fence"] ||
            row.residentCity)
        ) {
          customer.residentCity =
            row["resident-city"] ||
            row["Resident City"] ||
            row["Resident city for geo fence"] ||
            row.residentCity ||
            "";
        }
        // Update notes if not already set
        if (!customer.notes && (row["notes"] || row["Notes"] || row["NOTES"])) {
          const notesRaw = row["notes"] || row["Notes"] || row["NOTES"] || "";
          const notesTrimmed = notesRaw.trim();
          customer.notes = notesTrimmed || null;
        }
      }

      const customer = this.allCustomers.get(etcNumber);

      // Add vehicle information
      const vehicle = {
        rank:
          row["Vehicle-Rank"] ||
          row["Vehicle\nRank #"] ||
          row["Vehicle Rank #"] ||
          row.vehicleRank ||
          "",
        regNumber:
          row["Vehicle-Reg-number"] ||
          row["Vehicle\nReg no."] ||
          row["Vehicle Reg no."] ||
          row.vehicleReg ||
          "",
        model:
          row["Vehicle-Model"] ||
          row["Vehicle Model"] ||
          row.vehicleModel ||
          "",
        package:
          row["Package-Activated"] ||
          row["Package\nActivated"] ||
          row["Package Activated"] ||
          row.package ||
          "",
        amount: this.parseAmount(
          row["Payment-Amount"] ||
            row["Payment\nAmount"] ||
            row["Payment Amount"] ||
            row.paymentAmount ||
            "0"
        ),
        startDate:
          row["Tenure-Start-Date"] ||
          row["Tenure\nStart Date"] ||
          row["Tenure Start Date"] ||
          row.tenureStart ||
          "",
        endDate:
          row["Tenure-Ending-Date"] ||
          row["Tenure\nEnding Date"] ||
          row["Tenure Ending Date"] ||
          row.tenureEnd ||
          "",
        tenureLength:
          row["Tenure-Length"] ||
          row["Tenure\nLength"] ||
          row["Tenure Length"] ||
          row.tenureLength ||
          "",
        emailTemplate:
          row["email-template"] ||
          row["Email-Template"] ||
          row.emailTemplate ||
          "", // No default - will be validated
        sourceFile: sourceFile, // Track which file this vehicle came from
      };

      // Validate that emailTemplate is provided
      if (!vehicle.emailTemplate || vehicle.emailTemplate.trim() === "") {
        throw new Error(
          `❌ Row missing email template for ETC ${etcNumber} in ${sourceFile}. ` +
          `Please provide a value in the 'email-template' column (e.g., 'renewal-pending', 'new-account', 'device-transfer', etc.)`
        );
      }

      customer.vehicles.push(vehicle);
      customer.totalAmount += vehicle.amount;

      // Track earliest expiry date
      const expiryDate = this.parseDate(vehicle.endDate);
      if (
        expiryDate &&
        (!customer.earliestExpiry || expiryDate < customer.earliestExpiry)
      ) {
        customer.earliestExpiry = expiryDate;
      }
    });
  }

  standardizeDatesInRows(rows) {
    // Identify date columns
    const dateColumns = [
      "Tenure-Start-Date",
      "Tenure\nStart Date",
      "Tenure Start Date",
      "tenureStart",
      "Tenure-Ending-Date",
      "Tenure\nEnding Date",
      "Tenure Ending Date",
      "tenureEnd",
      "installation-date",
      "Installation Date",
      "installationDate",
    ];

    return rows.map((row) => {
      const correctedRow = { ...row };

      // Check each date column and standardize format
      for (const key in correctedRow) {
        if (dateColumns.includes(key) && correctedRow[key]) {
          const standardizedDate = this.formatDateTo4Digit(
            correctedRow[key]
          );
          if (standardizedDate !== correctedRow[key]) {
            correctedRow[key] = standardizedDate;
          }
        }
      }

      return correctedRow;
    });
  }

  formatDateTo4Digit(dateStr) {
    if (!dateStr) return dateStr;

    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const monthStr = parts[1];
        let year = parseInt(parts[2]);

        // Only process if year is 2-digit
        if (year < 100) {
          year += 2000;
          // Return in format: DD-MMM-YYYY (e.g., 21-Jan-2026)
          return `${String(day).padStart(2, "0")}-${monthStr}-${year}`;
        }
      }
    } catch (error) {
      // If parsing fails, return original
      return dateStr;
    }

    return dateStr; // Return original if already 4-digit year
  }

  async rewriteCSVFile(csvFilePath, rows) {
    if (rows.length === 0) return;

    try {
      // Get headers from first row
      const headers = Object.keys(rows[0]);

      // Build CSV content
      let csvContent = headers.join(",") + "\n";

      rows.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header] || "";
          // Escape quotes and wrap in quotes if contains comma, newline or quote
          if (
            value.toString().includes(",") ||
            value.toString().includes("\n") ||
            value.toString().includes('"')
          ) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvContent += values.join(",") + "\n";
      });

      // Write back to file
      await fs.writeFile(csvFilePath, csvContent, "utf-8");
    } catch (error) {
      console.error("Error rewriting CSV file:", error.message);
      throw error;
    }
  }

  extractEmail(row) {
    // For now, using the email from CSV (seems to be a placeholder)
    // You'll need to update this with actual customer emails
    const email =
      row["Send-Email-To"] ||
      row["eTrack-User-1"] ||
      row["eTrack\nUser-1"] ||
      row["eTrack User-1"] ||
      row.email ||
      "";

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : "";
  }

  parseAmount(amountStr) {
    if (!amountStr) return 0;

    // Remove "Rs" and commas, convert to number
    const cleaned = amountStr
      .toString()
      .replace(/Rs\s?|,/g, "")
      .trim();
    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : amount;
  }

  parseDate(dateStr) {
    if (!dateStr) return null;

    // Handle various date formats like "12-Aug-25", "25-Aug-24"
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = this.getMonthNumber(parts[1]);
        let year = parseInt(parts[2]);

        // Handle 2-digit years
        if (year < 100) {
          year += 2000;
        }

        return new Date(year, month - 1, day);
      }
    } catch (error) {
      console.warn("⚠️  Could not parse date:", dateStr);
    }

    return null;
  }

  getMonthNumber(monthStr) {
    const months = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
    };
    return months[monthStr] || 1;
  }

  determineEmailTemplate(customer) {
    // If customer has no vehicles, throw error (should not happen if validation works)
    if (!customer.vehicles || customer.vehicles.length === 0) {
      throw new Error(
        `❌ Customer ${customer.etcNumber} has no vehicles and no template specified.`
      );
    }

    // Get all unique templates from vehicles
    const templates = [
      ...new Set(customer.vehicles.map((v) => v.emailTemplate)),
    ];

    // If all vehicles have the same template, use that
    if (templates.length === 1) {
      return templates[0];
    }

    // If mixed templates, prioritize based on business logic:
    // 1. renewal-done (confirmed renewals take priority)
    // 2. device-transfer, device-addition, device-redo
    // 3. new-account
    // 4. renewal-pending (fallback if mixed)
    if (templates.includes("renewal-done")) {
      return "renewal-done";
    }
    if (templates.includes("device-transfer")) {
      return "device-transfer";
    }
    if (templates.includes("device-addition")) {
      return "device-addition";
    }
    if (templates.includes("device-redo")) {
      return "device-redo";
    }
    if (templates.includes("new-account")) {
      return "new-account";
    }

    return templates[0]; // Use first template if no priority match
  }

  finalizeCustomerTemplates() {
    // Set email template for each customer based on their vehicles
    for (const customer of this.allCustomers.values()) {
      customer.emailTemplate = this.determineEmailTemplate(customer);
    }
  }

  getCustomersData() {
    // Convert sourceFiles Set to Array for JSON serialization and sort vehicles by rank
    return Array.from(this.allCustomers.values()).map((customer) => ({
      ...customer,
      vehicles: this.sortVehiclesByRank(customer.vehicles),
      sourceFiles: Array.from(customer.sourceFiles),
    }));
  }

  sortVehiclesByRank(vehicles) {
    return vehicles.sort((a, b) => {
      // Convert rank to number for proper sorting
      const rankA = parseInt(a.rank) || 999; // Use 999 for missing/invalid ranks
      const rankB = parseInt(b.rank) || 999;
      return rankA - rankB;
    });
  }

  filterByETC(etcNumbers) {
    const filtered = new Map();
    etcNumbers.forEach((etc) => {
      // Convert to string to match CSV data
      const etcStr = String(etc);
      if (this.allCustomers.has(etcStr)) {
        filtered.set(etcStr, this.allCustomers.get(etcStr));
      }
    });
    return Array.from(filtered.values()).map((customer) => ({
      ...customer,
      vehicles: this.sortVehiclesByRank(customer.vehicles),
      sourceFiles: Array.from(customer.sourceFiles),
    }));
  }

  filterByExpiryDate(daysFromNow = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);

    return this.getCustomersData().filter((customer) => {
      return customer.earliestExpiry && customer.earliestExpiry <= cutoffDate;
    });
  }

  getProcessingSummary() {
    return {
      filesProcessed: this.processedFiles.length,
      totalCustomers: this.allCustomers.size,
      processedFiles: this.processedFiles.map((f) => ({
        fileName: f.fileName,
        rowCount: f.rowCount,
        processedAt: f.processedAt,
      })),
    };
  }
}

module.exports = CSVBatchProcessor;
