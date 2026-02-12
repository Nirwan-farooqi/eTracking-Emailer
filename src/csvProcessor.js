const fs = require("fs-extra");
const csv = require("csv-parser");
const path = require("path");

class CSVProcessor {
  constructor() {
    this.customers = new Map();
  }

  async processCSV(csvFilePath) {
    console.log("📊 Processing CSV file...");

    return new Promise((resolve, reject) => {
      const results = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (row) => {
          results.push(row);
        })
        .on("end", () => {
          console.log(`✅ Processed ${results.length} rows from CSV`);
          this.groupCustomersByETC(results);
          resolve(this.customers);
        })
        .on("error", (error) => {
          console.error("❌ Error processing CSV:", error);
          reject(error);
        });
    });
  }

  groupCustomersByETC(rows) {
    console.log("🔄 Grouping customers by ETC number...");

    rows.forEach((row) => {
      const etcNumber = row["ETC\n#"] || row["ETC #"] || row.ETC;

      if (!etcNumber) {
        console.warn("⚠️  Row missing ETC number:", row);
        return;
      }

      if (!this.customers.has(etcNumber)) {
        // Extract and trim notes field, only keep if it has actual content
        const notesRaw = row["Notes"] || row["notes"] || row["NOTES"] || "";
        const notesTrimmed = notesRaw.trim();

        this.customers.set(etcNumber, {
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
          notes: notesTrimmed || null, // Only set if not empty after trimming
          vehicles: [],
          totalAmount: 0,
          earliestExpiry: null,
        });
      }

      const customer = this.customers.get(etcNumber);

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
      };

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

    console.log(`✅ Grouped ${this.customers.size} unique customers`);
  }

  extractEmail(row) {
    // Extract email from CSV with support for different column name formats
    const email =
      row["Send-Email-To"] ||
      row["Send Email To"] ||
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

  getCustomersData() {
    return Array.from(this.customers.values());
  }

  filterByETC(etcNumbers) {
    const filtered = new Map();
    etcNumbers.forEach((etc) => {
      if (this.customers.has(etc)) {
        filtered.set(etc, this.customers.get(etc));
      }
    });
    return Array.from(filtered.values());
  }

  filterByExpiryDate(daysFromNow = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow);

    return this.getCustomersData().filter((customer) => {
      return customer.earliestExpiry && customer.earliestExpiry <= cutoffDate;
    });
  }
}

module.exports = CSVProcessor;
