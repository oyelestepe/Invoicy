const fetch = require('node-fetch');
const http = require('http');

const data = JSON.stringify({
  invoiceData: {
    invoiceNumber: 'INV-TEST-001',
    finalAmount: 500,
    clientName: 'Test Client',
    currency: 'USD',
    issueDate: '2023-10-27',
    dueDate: '2023-11-27'
  }
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/preview-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`StatusCode: ${res.statusCode}`);
  let body = '';

  res.on('data', (d) => {
    body += d;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      if (parsed.html && parsed.html.includes('INV-TEST-001') && parsed.html.includes('Test Client')) {
        console.log('Verification Success: HTML returned and contains correct data.');
      } else {
        console.log('Verification Failed: HTML missing or incorrect data.');
        console.log(body);
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
