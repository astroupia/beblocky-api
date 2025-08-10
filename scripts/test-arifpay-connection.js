import { createCheckoutSession } from 'arifpay-express';
import dotenv from 'dotenv';

async function testArifPayConnection() {
  console.log('🔍 Testing ArifPay Connection...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(
    'ARIFPAY_API_KEY:',
    process.env.ARIFPAY_API_KEY ? '✅ Set' : '❌ Missing',
  );
  console.log(
    'PAYMENT_BENEFICIARIES:',
    process.env.PAYMENT_BENEFICIARIES ? '✅ Set' : '❌ Missing',
  );

  if (process.env.PAYMENT_BENEFICIARIES) {
    try {
      const beneficiaries = JSON.parse(process.env.PAYMENT_BENEFICIARIES);
      console.log('✅ PAYMENT_BENEFICIARIES JSON is valid');
      console.log('Beneficiaries structure:', Object.keys(beneficiaries));
    } catch (error) {
      console.log('❌ PAYMENT_BENEFICIARIES JSON is invalid:', error.message);
    }
  }

  console.log('\n🧪 Testing with sample payload...');

  // Sample payment payload
  const testPayload = {
    userId: 'test-user-123',
    amount: 100,
    cancelUrl: 'https://example.com/cancel',
    successUrl: 'https://example.com/success',
    errorUrl: 'https://example.com/error',
    notifyUrl: 'https://example.com/notify',
    phone: 251912345678,
    email: 'test@example.com',
    paymentMethods: ['CBE_BIRR', 'AWASH_BIRR'],
    expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    items: [
      {
        name: 'Test Item',
        quantity: 1,
        price: 100,
        description: 'Test item for debugging',
      },
    ],
    lang: 'en',
    beneficiaries: process.env.PAYMENT_BENEFICIARIES
      ? JSON.parse(process.env.PAYMENT_BENEFICIARIES)
      : {},
  };

  console.log('📦 Test Payload:');
  console.log(JSON.stringify(testPayload, null, 2));

  try {
    console.log('\n🚀 Attempting to create ArifPay session...');
    const result = await createCheckoutSession(testPayload);
    console.log('✅ Success! Session created:');
    console.log('Session ID:', result.data.sessionId);
    console.log('Checkout URL:', result.data.checkoutUrl);
  } catch (error) {
    console.log('❌ Failed to create session:');
    console.log('Error:', error.message);

    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log(
        'Response Data:',
        JSON.stringify(error.response.data, null, 2),
      );
    }

    if (error.code) {
      console.log('Error Code:', error.code);
    }
  }
}

// Load environment variables
dotenv.config();

// Run the test
testArifPayConnection().catch(console.error);
