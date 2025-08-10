const dotenv = require('dotenv');
const https = require('https');

// Load environment variables
dotenv.config();

console.log('🔍 Testing ArifPay API Endpoints...\n');

const endpoints = [
  '/api/v1/checkout/session',
  '/api/v1/checkout',
  '/api/checkout/session',
  '/api/checkout',
  '/v1/checkout/session',
  '/v1/checkout',
  '/checkout/session',
  '/checkout',
];

const postData = JSON.stringify({
  amount: 100,
  phone: 251912345678,
  email: 'test@example.com',
  expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  items: [
    {
      name: 'Test Item',
      quantity: 1,
      price: 100,
    },
  ],
  beneficiaries: process.env.PAYMENT_BENEFICIARIES ? JSON.parse(process.env.PAYMENT_BENEFICIARIES) : {},
  cancelUrl: 'https://example.com/cancel',
  successUrl: 'https://example.com/success',
  errorUrl: 'https://example.com/error',
  notifyUrl: 'https://example.com/notify',
});

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'gateway.arifpay.org',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-arifpay-key': process.env.ARIFPAY_API_KEY || '',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          path: path,
          status: res.statusCode,
          body: data,
          headers: res.headers,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        path: path,
        status: 'ERROR',
        body: error.message,
        headers: {},
      });
    });

    req.write(postData);
    req.end();
  });
}

async function testAllEndpoints() {
  for (const endpoint of endpoints) {
    console.log(`Testing endpoint: ${endpoint}`);
    const result = await testEndpoint(endpoint);
    
    if (result.status === 200) {
      console.log(`✅ SUCCESS: ${endpoint} - Status: ${result.status}`);
      console.log('Response:', result.body);
      console.log('---');
    } else if (result.status === 404) {
      console.log(`❌ 404: ${endpoint}`);
      console.log('---');
    } else if (result.status === 401) {
      console.log(`🔐 401 (Auth Error): ${endpoint}`);
      console.log('Response:', result.body);
      console.log('---');
    } else if (result.status === 400) {
      console.log(`⚠️ 400 (Bad Request): ${endpoint}`);
      console.log('Response:', result.body);
      console.log('---');
    } else {
      console.log(`❓ ${result.status}: ${endpoint}`);
      console.log('Response:', result.body);
      console.log('---');
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testAllEndpoints(); 