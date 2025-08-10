const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testSubscriptionInheritance() {
  console.log(
    '🧪 Testing Subscription Inheritance for Parent-Child Relationship\n',
  );

  try {
    // Step 1: Create a parent user first
    console.log('1️⃣ Creating parent user...');
    const parentUserResponse = await axios.post(`${BASE_URL}/users`, {
      email: 'parent@example.com',
      name: 'Test Parent',
      role: 'parent',
    });

    const parentUser = parentUserResponse.data;
    console.log(`✅ Parent user created: ${parentUser._id}`);

    // Step 2: Create a parent with a premium subscription
    console.log('\n2️⃣ Creating parent with premium subscription...');
    const parentResponse = await axios.post(`${BASE_URL}/parents/from-user`, {
      userId: parentUser._id,
      phoneNumber: '+251911234567',
      address: {
        subCity: 'Bole',
        city: 'Addis Ababa',
        country: 'Ethiopia',
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Spouse',
        phone: '+251911234568',
      },
    });

    const parent = parentResponse.data;
    console.log(`✅ Parent created: ${parent._id}`);

    // Step 3: Create a premium subscription for the parent
    console.log('\n3️⃣ Creating premium subscription for parent...');
    const subscriptionResponse = await axios.post(`${BASE_URL}/subscriptions`, {
      userId: parent.userId,
      planName: 'Pro-Bundle',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      autoRenew: true,
      price: 99.99,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Unlimited courses',
        'Premium support',
        'Advanced analytics',
        'Priority access',
        'Custom certificates',
      ],
      lastPaymentDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
    });

    console.log(
      `✅ Premium subscription created: ${subscriptionResponse.data._id}`,
    );

    // Step 4: Create a user for the child
    console.log('\n4️⃣ Creating user for child...');
    const childUserResponse = await axios.post(`${BASE_URL}/users`, {
      email: 'child@example.com',
      name: 'Test Child',
      role: 'student',
    });

    const childUser = childUserResponse.data;
    console.log(`✅ Child user created: ${childUser._id}`);

    // Step 5: Add child to parent (this should trigger subscription inheritance)
    console.log('\n5️⃣ Adding child to parent (should inherit subscription)...');
    const addChildResponse = await axios.post(
      `${BASE_URL}/parents/${parent._id}/children`,
      {
        email: 'child@example.com',
        dateOfBirth: '2010-05-15',
        grade: 5,
        gender: 'male',
        section: 'A',
        emergencyContact: {
          name: 'Parent Emergency',
          relationship: 'Parent',
          phone: '+251911234567',
        },
      },
    );

    console.log('✅ Child added to parent successfully!');
    console.log('📋 Response details:');
    console.log(`   - Parent ID: ${addChildResponse.data.parent._id}`);
    console.log(`   - Student ID: ${addChildResponse.data.student._id}`);
    console.log(
      `   - Subscription Inherited: ${addChildResponse.data.subscriptionInherited}`,
    );
    console.log(
      `   - Parent Plan: ${addChildResponse.data.parentSubscriptionPlan}`,
    );

    // Step 6: Verify child's subscription
    console.log('\n6️⃣ Verifying child subscription...');
    const childSubscriptionsResponse = await axios.get(
      `${BASE_URL}/subscriptions/user/${childUser._id}`,
    );

    if (childSubscriptionsResponse.data.length > 0) {
      const childSubscription = childSubscriptionsResponse.data[0];
      console.log('✅ Child subscription found:');
      console.log(`   - Plan: ${childSubscription.planName}`);
      console.log(`   - Status: ${childSubscription.status}`);
      console.log(`   - Price: $${childSubscription.price}`);
      console.log(`   - Features: ${childSubscription.features.join(', ')}`);

      if (
        childSubscription.planName === 'Pro-Bundle' &&
        childSubscription.price === 0
      ) {
        console.log(
          "🎉 SUCCESS: Child successfully inherited parent's premium subscription!",
        );
      } else {
        console.log('❌ FAILED: Child did not inherit subscription correctly');
      }
    } else {
      console.log('❌ FAILED: No subscription found for child');
    }

    // Step 7: Test with existing student
    console.log('\n7️⃣ Testing with existing student...');
    const existingChildUserResponse = await axios.post(`${BASE_URL}/users`, {
      email: 'existing-child@example.com',
      name: 'Existing Child',
      role: 'student',
    });

    const existingChildUser = existingChildUserResponse.data;
    console.log(`✅ Existing child user created: ${existingChildUser._id}`);

    // Create a basic subscription for existing child
    await axios.post(`${BASE_URL}/subscriptions`, {
      userId: existingChildUser._id,
      planName: 'Free',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      price: 0,
      currency: 'USD',
      billingCycle: 'monthly',
      features: ['Basic access'],
      lastPaymentDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    });

    // Add existing child to parent (should upgrade subscription)
    const addExistingChildResponse = await axios.post(
      `${BASE_URL}/parents/${parent._id}/children`,
      {
        email: 'existing-child@example.com',
        dateOfBirth: '2012-03-20',
        grade: 3,
        gender: 'female',
        section: 'B',
      },
    );

    console.log('✅ Existing child added to parent!');
    console.log(
      `   - Subscription Inherited: ${addExistingChildResponse.data.subscriptionInherited}`,
    );
    console.log(
      `   - Parent Plan: ${addExistingChildResponse.data.parentSubscriptionPlan}`,
    );

    // Verify existing child's subscription was upgraded
    const existingChildSubscriptionsResponse = await axios.get(
      `${BASE_URL}/subscriptions/user/${existingChildUser._id}`,
    );
    const existingChildSubscription =
      existingChildSubscriptionsResponse.data[0];

    if (existingChildSubscription.planName === 'Pro-Bundle') {
      console.log(
        "🎉 SUCCESS: Existing child subscription was upgraded to parent's plan!",
      );
    } else {
      console.log('❌ FAILED: Existing child subscription was not upgraded');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSubscriptionInheritance();
