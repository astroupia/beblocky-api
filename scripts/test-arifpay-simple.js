const dotenv = require('dotenv');
const https = require('https');

// Load environment variables
dotenv.config();

console.log('🔍 Testing ArifPay Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('ARIFPAY_API_KEY:', process.env.ARIFPAY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('PAYMENT_BENEFICIARIES:', process.env.PAYMENT_BENEFICIARIES ? '✅ Set' : '❌ Missing');

if (process.env.ARIFPAY_API_KEY) {
  console.log('API Key length:', process.env.ARIFPAY_API_KEY.length);
  console.log('API Key starts with:', process.env.ARIFPAY_API_KEY.substring(0, 10) + '...');
}

if (process.env.PAYMENT_BENEFICIARIES) {
  try {
    const beneficiaries = JSON.parse(process.env.PAYMENT_BENEFICIARIES);
    console.log('✅ PAYMENT_BENEFICIARIES JSON is valid');
    console.log('Beneficiaries:', beneficiaries);
  } catch (error) {
    console.log('❌ PAYMENT_BENEFICIARIES JSON is invalid:', error.message);
  }
}

console.log('\n🔍 Checking ArifPay package...');

try {
  const arifpayPackage = require('arifpay-express');
  console.log('✅ ArifPay package loaded successfully');
  console.log('Available exports:', Object.keys(arifpayPackage));
  
  if (arifpayPackage.createCheckoutSession) {
    console.log('✅ createCheckoutSession function is available');
  } else {
    console.log('❌ createCheckoutSession function is NOT available');
  }
} catch (error) {
  console.log('❌ Failed to load ArifPay package:', error.message);
}

console.log('\n🔍 Testing simple HTTP request to ArifPay...');

const postData = JSON.stringify({
  // Minimal test payload
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

const options = {
  hostname: 'gateway.arifpay.org',
  port: 443,
  path: '/api/v1/checkout/session',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-arifpay-key': process.env.ARIFPAY_API_KEY || '',
    'Content-Length': Buffer.byteLength(postData),
  },
};

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
      console.log('✅ ArifPay API is responding correctly');
    } else {
      console.log('❌ ArifPay API returned error status:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ HTTP request failed:', error.message);
});

req.write(postData);
req.end(); 