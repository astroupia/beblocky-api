const dotenv = require('dotenv');
const https = require('https');

// Load environment variables
dotenv.config();

console.log('🔍 Testing Correct ArifPay Endpoint...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('API_KEY:', process.env.API_KEY ? '✅ Set' : '❌ Missing');
console.log(
  'ARIFPAY_API_KEY:',
  process.env.ARIFPAY_API_KEY ? '✅ Set' : '❌ Missing',
);

// Use the correct endpoint that ArifPay package uses
const correctEndpoint = '/api/checkout/session';
const apiKey = process.env.API_KEY || process.env.ARIFPAY_API_KEY;

if (!apiKey) {
  console.log(
    '❌ No API key found! Please set either API_KEY or ARIFPAY_API_KEY',
  );
  process.exit(1);
}

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
  beneficiaries: process.env.PAYMENT_BENEFICIARIES
    ? JSON.parse(process.env.PAYMENT_BENEFICIARIES)
    : {},
  cancelUrl: 'https://example.com/cancel',
  successUrl: 'https://example.com/success',
  errorUrl: 'https://example.com/error',
  notifyUrl: 'https://example.com/notify',
  paymentMethods: ['TELEBIRR', 'AWASH', 'CBE'],
  lang: 'EN',
});

const options = {
  hostname: 'gateway.arifpay.org',
  port: 443,
  path: correctEndpoint,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-arifpay-key': apiKey,
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log(`🔍 Testing endpoint: ${correctEndpoint}`);
console.log(`🔍 Using API key: ${apiKey.substring(0, 10)}...`);
console.log(`🔍 Request payload:`, postData);

const req = https.request(options, (res) => {
  console.log('Response Status:', res.statusCode);
  console.log('Response Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:', data);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ SUCCESS: ArifPay API is working correctly!');
    } else if (res.statusCode === 400) {
      console.log('⚠️ 400 (Bad Request): Check the request payload format');
    } else if (res.statusCode === 401) {
      console.log('🔐 401 (Unauthorized): Check your API key');
    } else if (res.statusCode === 404) {
      console.log('❌ 404 (Not Found): Wrong endpoint');
    } else {
      console.log(`❓ ${res.statusCode}: Unexpected response`);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ HTTP request failed:', error.message);
});

req.write(postData);
req.end();
