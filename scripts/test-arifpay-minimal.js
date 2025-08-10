const dotenv = require('dotenv');
const https = require('https');

// Load environment variables
dotenv.config();

console.log('🔍 Testing ArifPay with Minimal Payload...\n');

const API_KEY = process.env.API_KEY || process.env.ARIFPAY_API_KEY;

if (!API_KEY) {
  console.log('❌ ERROR: No API key found!');
  process.exit(1);
}

// Test with minimal required fields only
const minimalPayload = {
  phone: 251912345678,
  cancelUrl: 'https://example.com/cancel',
  errorUrl: 'https://example.com/error',
  notifyUrl: 'https://example.com/notify',
  successUrl: 'https://example.com/success',
  items: [
    {
      name: 'Test Item',
      quantity: 1,
      price: 100,
    },
  ],
  beneficiaries: process.env.PAYMENT_BENEFICIARIES
    ? JSON.parse(process.env.PAYMENT_BENEFICIARIES)
    : {},
};

const options = {
  hostname: 'gateway.arifpay.org',
  port: 443,
  path: '/api/checkout/session',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-arifpay-key': API_KEY,
    'Content-Length': Buffer.byteLength(JSON.stringify(minimalPayload)),
  },
};

console.log('🔍 Testing with minimal payload:');
console.log(JSON.stringify(minimalPayload, null, 2));

const req = https.request(options, (res) => {
  console.log('\n📡 Response Status:', res.statusCode);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📡 Response Body:', data);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ SUCCESS: Minimal payload works!');
    } else if (res.statusCode === 400) {
      console.log('⚠️ 400: Even minimal payload fails');
      console.log('This suggests an issue with ArifPay API or the package');
    }
  });
});

req.on('error', (error) => {
  console.log('❌ HTTP request failed:', error.message);
});

req.write(JSON.stringify(minimalPayload));
req.end();
