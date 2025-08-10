const dotenv = require('dotenv');
const https = require('https');

// Load environment variables
dotenv.config();

console.log('🔍 Testing ArifPay Actual Endpoint (from package)...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('API_KEY:', process.env.API_KEY ? '✅ Set' : '❌ Missing');
console.log(
  'ARIFPAY_API_KEY:',
  process.env.ARIFPAY_API_KEY ? '✅ Set' : '❌ Missing',
);
console.log(
  'BASE_URL:',
  process.env.BASE_URL || 'https://gateway.arifpay.org/api',
);
console.log('CHECKOUT_URL:', process.env.CHECKOUT_URL || '/checkout/session');

// Use the exact same logic as the ArifPay package
const BASE_URL = process.env.BASE_URL || 'https://gateway.arifpay.org/api';
const CHECKOUT_URL = process.env.CHECKOUT_URL || '/checkout/session';
const API_KEY = process.env.API_KEY;

const fullUrl = `${BASE_URL}${CHECKOUT_URL}`;

console.log(`🔍 Full URL being used: ${fullUrl}`);
console.log(
  `🔍 API Key being used: ${API_KEY ? API_KEY.substring(0, 10) + '...' : '❌ MISSING'}`,
);

if (!API_KEY) {
  console.log('❌ ERROR: API_KEY environment variable is missing!');
  console.log('The ArifPay package expects process.env.API_KEY');
  console.log(
    'You have ARIFPAY_API_KEY set, but the package looks for API_KEY',
  );
  console.log('\n🔧 SOLUTION: Add this to your .env file:');
  console.log(`API_KEY=${process.env.ARIFPAY_API_KEY || 'your_api_key_here'}`);
  process.exit(1);
}

const postData = JSON.stringify({
  phone: 251912345678,
  email: 'test@example.com',
  cancelUrl: 'https://example.com/cancel',
  successUrl: 'https://example.com/success',
  errorUrl: 'https://example.com/error',
  notifyUrl: 'https://example.com/notify',
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
});

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
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log(`🔍 Making request to: ${hostname}${path}`);
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
      console.log('🎉 This means your API key and endpoint are correct!');
    } else if (res.statusCode === 400) {
      console.log(
        "⚠️ 400 (Bad Request): The endpoint exists but there's an issue with the payload",
      );
      console.log(
        'This suggests the endpoint is correct but the request format needs adjustment',
      );
    } else if (res.statusCode === 401) {
      console.log(
        '🔐 401 (Unauthorized): The endpoint exists but the API key is invalid',
      );
      console.log('Check your API key or contact ArifPay support');
    } else if (res.statusCode === 404) {
      console.log('❌ 404 (Not Found): The endpoint does not exist');
      console.log(
        'This suggests the ArifPay API has changed or the endpoint is wrong',
      );
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
