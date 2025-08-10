const dotenv = require('dotenv');
const https = require('https');

// Load environment variables
dotenv.config();

console.log('🔍 Testing ArifPay with Different Payload Variations...\n');

const API_KEY = process.env.API_KEY || process.env.ARIFPAY_API_KEY;

if (!API_KEY) {
  console.log('❌ ERROR: No API key found!');
  process.exit(1);
}

// Test different payload variations
const testVariations = [
  {
    name: 'Basic Required Fields Only',
    payload: {
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
    },
  },
  {
    name: 'With Amount Field',
    payload: {
      amount: 100,
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
    },
  },
  {
    name: 'With Email and Lang',
    payload: {
      phone: 251912345678,
      email: 'test@example.com',
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
      lang: 'EN',
    },
  },
  {
    name: 'With Payment Methods',
    payload: {
      phone: 251912345678,
      cancelUrl: 'https://example.com/cancel',
      errorUrl: 'https://example.com/error',
      notifyUrl: 'https://example.com/notify',
      successUrl: 'https://example.com/success',
      paymentMethods: ['TELEBIRR'],
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
    },
  },
];

function testPayload(payload, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'gateway.arifpay.org',
      port: 443,
      path: '/api/checkout/session',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-arifpay-key': API_KEY,
        'Content-Length': Buffer.byteLength(JSON.stringify(payload)),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          name,
          status: res.statusCode,
          body: data,
          success: res.statusCode >= 200 && res.statusCode < 300,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name,
        status: 'ERROR',
        body: error.message,
        success: false,
      });
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing different payload variations...\n');

  for (const variation of testVariations) {
    console.log(`📝 Testing: ${variation.name}`);
    const result = await testPayload(variation.payload, variation.name);

    if (result.success) {
      console.log(`✅ SUCCESS: ${result.name} - Status: ${result.status}`);
      console.log('Response:', result.body);
      console.log('🎉 Found working payload format!');
      break;
    } else {
      console.log(`❌ FAILED: ${result.name} - Status: ${result.status}`);
      if (result.body) {
        console.log('Response:', result.body);
      }
    }
    console.log('---');

    // Wait a bit between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n🔍 All variations tested. If all failed, the issue might be:');
  console.log('1. ArifPay API has changed');
  console.log('2. The arifpay-express package is outdated');
  console.log('3. ArifPay service is having issues');
  console.log('4. Contact ArifPay support for current API requirements');
}

runTests();
