const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Test payloads for Stripe integration
const testPayloads = {
  // Test 1: One-time payment with minimal required fields
  oneTimePayment: {
    userId: 'test-user-123',
    items: [
      {
        name: 'Test Course',
        price: 1000, // $10.00 in cents
        quantity: 1,
        description: 'A test course for Stripe integration',
      },
    ],
    successUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel',
    errorUrl: 'https://yourapp.com/error',
    notifyUrl: 'https://yourapp.com/webhook',
    phone: 251911234567,
    expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  },

  // Test 2: Subscription payment (if you have recurring price IDs)
  subscriptionPayment: {
    userId: 'test-user-456',
    items: [
      {
        name: 'Premium Subscription',
        price: 2000, // $20.00 in cents
        quantity: 1,
        description: 'Monthly premium subscription',
      },
    ],
    successUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel',
    errorUrl: 'https://yourapp.com/error',
    notifyUrl: 'https://yourapp.com/webhook',
    phone: 251911234568,
    expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },

  // Test 3: Multiple items
  multipleItems: {
    userId: 'test-user-789',
    items: [
      {
        name: 'Course 1',
        price: 1500, // $15.00
        quantity: 1,
        description: 'First course',
      },
      {
        name: 'Course 2',
        price: 2500, // $25.00
        quantity: 2,
        description: 'Second course',
      },
    ],
    successUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel',
    errorUrl: 'https://yourapp.com/error',
    notifyUrl: 'https://yourapp.com/webhook',
    phone: 251911234569,
    expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },

  // Test 4: With email
  withEmail: {
    userId: 'test-user-email',
    items: [
      {
        name: 'Email Test Course',
        price: 500, // $5.00
        quantity: 1,
        description: 'Test course with email',
      },
    ],
    successUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel',
    errorUrl: 'https://yourapp.com/error',
    notifyUrl: 'https://yourapp.com/webhook',
    phone: 251911234570,
    email: 'test@example.com',
    expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },

  // Test 5: Invalid payload (missing required fields)
  invalidPayload: {
    userId: 'test-user-invalid',
    // Missing items, successUrl, cancelUrl, etc.
  },
};

async function testStripePayloads() {
  console.log('🧪 Testing Stripe Integration with Various Payloads\n');

  for (const [testName, payload] of Object.entries(testPayloads)) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing: ${testName.toUpperCase()}`);
    console.log(`${'='.repeat(50)}`);

    try {
      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${BASE_URL}/stripe/stripe-checkout`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('✅ SUCCESS!');
      console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ FAILED!');
      console.log(
        '📥 Error Response:',
        JSON.stringify(error.response?.data || error.message, null, 2),
      );

      if (error.response?.status) {
        console.log(`📊 Status Code: ${error.response.status}`);
      }
    }

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 All Stripe payload tests completed!');
}

// Also export the payloads for manual testing
console.log('\n📋 Available Test Payloads:');
console.log('You can copy any of these payloads to test manually:\n');

Object.entries(testPayloads).forEach(([name, payload]) => {
  console.log(`${name.toUpperCase()}:`);
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n' + '-'.repeat(40) + '\n');
});

// Run the tests
testStripePayloads();
