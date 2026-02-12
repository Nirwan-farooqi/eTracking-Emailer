const TemplateEngine = require('./src/templateEngine');
const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');

async function test() {
  const templateEngine = new TemplateEngine();
  
  // Read CSV
  const csvPath = 'c:\\Users\\Dranzer\\Desktop\\a1-test.csv';
  const customers = [];
  
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      customers.push(row);
    })
    .on('end', async () => {
      console.log('CSV loaded:', customers.length, 'records');
      console.log('First record:', customers[0]);
      
      if (customers.length > 0) {
        try {
          const customer = customers[0];
          const template = customer["email-template"] || "renewal-pending";
          console.log('\nTesting render for template:', template);
          
          const html = await templateEngine.render(template, customer);
          
          console.log('\nHTML length:', html.length);
          console.log('First 500 chars:', html.substring(0, 500));
          
          // Save to file for inspection
          fs.writeFileSync('test-preview-output.html', html);
          console.log('\nHTML saved to test-preview-output.html');
        } catch (error) {
          console.error('\nError:', error.message);
          console.error(error.stack);
        }
      }
    });
}

test();
