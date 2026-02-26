#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const EmailSender = require('./src/emailSender');
const TemplateEngine = require('./src/templateEngine');

async function testPreview() {
  try {
    console.log('Testing template rendering...\n');
    
    // Initialize template engine
    const templateEngine = new TemplateEngine();
    
    // Test customer data
    const customer = {
      email: 'test@example.com',
      customer_name: 'Test Customer',
      etc_number: '12345',
      'email-template': 'renewal-pending'
    };
    
    console.log('1. Testing with renewal-pending template...');
    const template = 'renewal-pending';
    const templatePath = path.join(__dirname, 'templates', `${template}.hbs`);
    
    if (!fs.existsSync(templatePath)) {
      console.error(`❌ Template file not found: ${templatePath}`);
      process.exit(1);
    }
    
    console.log(`✅ Template file found at: ${templatePath}`);
    
    try {
      const html = await templateEngine.render(template, customer);
      console.log(`✅ Template rendered successfully`);
      console.log(`   HTML length: ${html.length} characters`);
      console.log(`   First 200 chars: ${html.substring(0, 200)}...`);
    } catch (error) {
      console.error(`❌ Failed to render template: ${error.message}`);
      process.exit(1);
    }
    
    console.log('\n2. Testing with new-account template...');
    const template2 = 'new-account';
    const templatePath2 = path.join(__dirname, 'templates', `${template2}.hbs`);
    
    if (!fs.existsSync(templatePath2)) {
      console.error(`❌ Template file not found: ${templatePath2}`);
      process.exit(1);
    }
    
    try {
      const html2 = await templateEngine.render(template2, customer);
      console.log(`✅ Template rendered successfully`);
      console.log(`   HTML length: ${html2.length} characters`);
    } catch (error) {
      console.error(`❌ Failed to render template: ${error.message}`);
      process.exit(1);
    }
    
    console.log('\n✅ All template rendering tests passed!');
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testPreview();
