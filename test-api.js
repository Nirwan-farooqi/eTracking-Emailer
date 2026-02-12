const http = require('http');

async function testAPI() {
  try {
    // Test status
    console.log('Testing /api/status...');
    let response = await makeRequest('GET', '/api/status');
    console.log('Status:', response);
    
    // Test preview
    if (response.success) {
      console.log('\nTesting /api/preview for record 0...');
      const body = JSON.stringify({ recordIndex: 0 });
      response = await makeRequest('POST', '/api/preview', body);
      console.log('Preview response:', {
        success: response.success,
        template: response.template,
        error: response.error,
        htmlLength: response.html ? response.html.length : 0,
        customer: response.customer ? response.customer.email : null
      });
    }
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

setTimeout(() => testAPI(), 1000);
