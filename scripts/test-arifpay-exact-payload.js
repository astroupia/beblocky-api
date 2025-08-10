const dotenv = require('dotenv');
const https = require('https');

// Load environment variables
dotenv.config();

console.log('🔍 Testing ArifPay with Exact Package Payload...\n');

// Use the exact same logic as the ArifPay package
const BASE_URL = process.env.BASE_URL || 'https://gateway.arifpay.org/api';
const CHECKOUT_URL = process.env.CHECKOUT_URL || '/checkout/session';
const API_KEY = process.env.API_KEY || process.env.ARIFPAY_API_KEY;

const fullUrl = `${BASE_URL}${CHECKOUT_URL}`;

console.log(`🔍 Full URL: ${fullUrl}`);
console.log(
  `🔍 API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : '❌ MISSING'}`,
);

if (!API_KEY) {
  console.log('❌ ERROR: No API key found!');
  process.exit(1);
}

// Use the EXACT payload structure from the ArifPay package
const checkoutPayload = {
  phone: 251912345678,
  cancelUrl: 'https://example.com/cancel',
  email: 'test@example.com',
  nonce: 'test-nonce-123', // This is required by ArifPay
  errorUrl: 'https://example.com/error',
  notifyUrl: 'https://example.com/notify',
  successUrl: 'https://example.com/success',
  paymentMethods: ['TELEBIRR', 'AWASH', 'CBE'],
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
  lang: 'EN',
};

// Parse the URL to get hostname and path
const url = new URL(fullUrl);
const hostname = url.hostname;
const path = url.pathname;

const options = {
  hostname: hostname,
  port: 443,
  path: path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-arifpay-key': API_KEY,
    'Content-Length': Buffer.byteLength(JSON.stringify(checkoutPayload)),
  },
};

console.log(`🔍 Making request to: ${hostname}${path}`);
console.log('🔍 Request payload:');
console.log(JSON.stringify(checkoutPayload, null, 2));

const req = https.request(options, (res) => {
  console.log('\n📡 Response Status:', res.statusCode);
  console.log('📡 Response Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📡 Response Body:', data);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ SUCCESS: ArifPay API is working correctly!');
      console.log('🎉 This means the payload format is correct!');
    } else if (res.statusCode === 400) {
      console.log(
        '⚠️ 400 (Bad Request): Still an issue with the payload format',
      );
      console.log("Let's check what specific field is causing the issue...");
    } else if (res.statusCode === 401) {
      console.log('🔐 401 (Unauthorized): API key issue');
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

req.write(JSON.stringify(checkoutPayload));
req.end();
