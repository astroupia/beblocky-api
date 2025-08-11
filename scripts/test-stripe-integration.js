const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration\n');

  try {
    // Test 1: One-time payment (should use 'payment' mode)
    console.log('1️⃣ Testing one-time payment...');
    const oneTimePaymentPayload = {
      userId: 'test-user-123',
      items: [
        {
          price: 'price_1OqX8X2eZvKYlo2C9qX8X2eZ', // Replace with actual one-time price ID
          quantity: 1,
        },
      ],
      successUrl: 'https://yourapp.com/success',
      cancelUrl: 'https://yourapp.com/cancel',
    };

    try {
      const oneTimeResponse = await axios.post(
        `${BASE_URL}/stripe/stripe-checkout`,
        oneTimePaymentPayload,
      );
      console.log(
        '✅ One-time payment checkout created:',
        oneTimeResponse.data,
      );
    } catch (error) {
      console.log(
        '❌ One-time payment failed:',
        error.response?.data || error.message,
      );
    }

    // Test 2: Subscription payment (should auto-detect and use 'subscription' mode)
    console.log('\n2️⃣ Testing subscription payment...');
    const subscriptionPayload = {
      userId: 'test-user-456',
      items: [
        {
          price: 'price_1OqX8X2eZvKYlo2C9qX8X2eZ', // Replace with actual recurring price ID
          quantity: 1,
        },
      ],
      successUrl: 'https://yourapp.com/success',
      cancelUrl: 'https://yourapp.com/cancel',
    };

    try {
      const subscriptionResponse = await axios.post(
        `${BASE_URL}/stripe/stripe-checkout`,
        subscriptionPayload,
      );
      console.log(
        '✅ Subscription checkout created:',
        subscriptionResponse.data,
      );
    } catch (error) {
      console.log(
        '❌ Subscription payment failed:',
        error.response?.data || error.message,
      );
    }

    // Test 3: Mixed prices (should fail with validation error)
    console.log('\n3️⃣ Testing mixed price types (should fail)...');
    const mixedPayload = {
      userId: 'test-user-789',
      items: [
        {
          price: 'price_1OqX8X2eZvKYlo2C9qX8X2eZ', // One-time price
          quantity: 1,
        },
        {
          price: 'price_1OqX8X2eZvKYlo2C9qX8X2eZ', // Recurring price
          quantity: 1,
        },
      ],
      successUrl: 'https://yourapp.com/success',
      cancelUrl: 'https://yourapp.com/cancel',
    };

    try {
      const mixedResponse = await axios.post(
        `${BASE_URL}/stripe/stripe-checkout`,
        mixedPayload,
      );
      console.log(
        '❌ Mixed prices should have failed but succeeded:',
        mixedResponse.data,
      );
    } catch (error) {
      if (
        error.response?.data?.message?.includes(
          'Cannot mix recurring and one-time prices',
        )
      ) {
        console.log('✅ Mixed prices correctly rejected with validation error');
      } else {
        console.log(
          '❌ Unexpected error for mixed prices:',
          error.response?.data || error.message,
        );
      }
    }

    // Test 4: Invalid price ID (should handle gracefully)
    console.log('\n4️⃣ Testing invalid price ID...');
    const invalidPayload = {
      userId: 'test-user-999',
      items: [
        {
          price: 'invalid_price_id',
          quantity: 1,
        },
      ],
      successUrl: 'https://yourapp.com/success',
      cancelUrl: 'https://yourapp.com/cancel',
    };

    try {
      const invalidResponse = await axios.post(
        `${BASE_URL}/stripe/stripe-checkout`,
        invalidPayload,
      );
      console.log('✅ Invalid price handled gracefully:', invalidResponse.data);
    } catch (error) {
      console.log(
        '❌ Invalid price error:',
        error.response?.data || error.message,
      );
    }

    console.log('\n🎉 Stripe integration tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testStripeIntegration();
