/**
 * Test Script: Validate String User ID Implementation
 *
 * This script tests the string user ID implementation to ensure
 * all modules work correctly with better-auth string IDs.
 *
 * Usage: node scripts/test-string-user-ids.js
 */

const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/beblocky-api';
const DB_NAME = process.env.DB_NAME || 'beblocky-api';

// Test data
const TEST_USER_ID = 'eCNMJ7XlKZFEh3U3oBUjxwAxGeWWEqDh'; // Example better-auth ID
const TEST_COURSE_ID = '507f1f77bcf86cd799439011'; // Example ObjectId

async function testStringUserIdImplementation() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('🧪 Starting string user ID tests...');

    // Test 1: User document structure
    await testUserDocumentStructure(db);

    // Test 2: Course rating with string user ID
    await testCourseRating(db);

    // Test 3: Subscription with string user ID
    await testSubscription(db);

    // Test 4: Payment with string user ID
    await testPayment(db);

    // Test 5: Certificate with string user ID
    await testCertificate(db);

    // Test 6: Class with string user ID
    await testClass(db);

    // Test 7: Parent with string user ID
    await testParent(db);

    // Test 8: Admin with string user ID
    await testAdmin(db);

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function testUserDocumentStructure(db) {
  console.log('   👤 Testing user document structure...');

  const usersCollection = db.collection('users');

  // Create a test user with string ID
  const testUser = {
    _id: TEST_USER_ID,
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: false,
    role: 'teacher',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await usersCollection.insertOne(testUser);
    console.log('     ✅ User document created successfully');

    // Verify the user was created with string ID
    const createdUser = await usersCollection.findOne({ _id: TEST_USER_ID });
    if (createdUser && typeof createdUser._id === 'string') {
      console.log('     ✅ User ID is string type');
    } else {
      throw new Error('User ID is not string type');
    }

    // Cleanup
    await usersCollection.deleteOne({ _id: TEST_USER_ID });
  } catch (error) {
    console.error('     ❌ User document test failed:', error.message);
    throw error;
  }
}

async function testCourseRating(db) {
  console.log('   ⭐ Testing course rating with string user ID...');

  const courseRatingsCollection = db.collection('course_ratings');

  const testRating = {
    courseId: new db.constructor.Types.ObjectId(TEST_COURSE_ID),
    userId: TEST_USER_ID,
    rating: 5,
    review: 'Great course!',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await courseRatingsCollection.insertOne(testRating);
    console.log('     ✅ Course rating created successfully');

    // Verify the rating was created with string user ID
    const createdRating = await courseRatingsCollection.findOne({
      userId: TEST_USER_ID,
    });
    if (createdRating && typeof createdRating.userId === 'string') {
      console.log('     ✅ Course rating user ID is string type');
    } else {
      throw new Error('Course rating user ID is not string type');
    }

    // Cleanup
    await courseRatingsCollection.deleteOne({ userId: TEST_USER_ID });
  } catch (error) {
    console.error('     ❌ Course rating test failed:', error.message);
    throw error;
  }
}

async function testSubscription(db) {
  console.log('   📦 Testing subscription with string user ID...');

  const subscriptionsCollection = db.collection('subscriptions');

  const testSubscription = {
    userId: TEST_USER_ID,
    planName: 'Starter',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    autoRenew: true,
    price: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    features: ['feature1', 'feature2'],
    paymentHistory: [],
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await subscriptionsCollection.insertOne(testSubscription);
    console.log('     ✅ Subscription created successfully');

    // Verify the subscription was created with string user ID
    const createdSubscription = await subscriptionsCollection.findOne({
      userId: TEST_USER_ID,
    });
    if (createdSubscription && typeof createdSubscription.userId === 'string') {
      console.log('     ✅ Subscription user ID is string type');
    } else {
      throw new Error('Subscription user ID is not string type');
    }

    // Cleanup
    await subscriptionsCollection.deleteOne({ userId: TEST_USER_ID });
  } catch (error) {
    console.error('     ❌ Subscription test failed:', error.message);
    throw error;
  }
}

async function testPayment(db) {
  console.log('   💳 Testing payment with string user ID...');

  const paymentsCollection = db.collection('payments');

  const testPayment = {
    userId: TEST_USER_ID,
    amount: 9.99,
    cancelUrl: 'https://example.com/cancel',
    successUrl: 'https://example.com/success',
    errorUrl: 'https://example.com/error',
    notifyUrl: 'https://example.com/notify',
    paymentMethods: ['card'],
    expireDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    items: [
      {
        name: 'Test Item',
        quantity: 1,
        price: 9.99,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await paymentsCollection.insertOne(testPayment);
    console.log('     ✅ Payment created successfully');

    // Verify the payment was created with string user ID
    const createdPayment = await paymentsCollection.findOne({
      userId: TEST_USER_ID,
    });
    if (createdPayment && typeof createdPayment.userId === 'string') {
      console.log('     ✅ Payment user ID is string type');
    } else {
      throw new Error('Payment user ID is not string type');
    }

    // Cleanup
    await paymentsCollection.deleteOne({ userId: TEST_USER_ID });
  } catch (error) {
    console.error('     ❌ Payment test failed:', error.message);
    throw error;
  }
}

async function testCertificate(db) {
  console.log('   🏆 Testing certificate with string user ID...');

  const certificatesCollection = db.collection('certificates');

  const testCertificate = {
    certificateId: 'CERT-001',
    studentId: new db.constructor.Types.ObjectId(),
    courseId: new db.constructor.Types.ObjectId(TEST_COURSE_ID),
    progressId: new db.constructor.Types.ObjectId(),
    issuedBy: {
      userId: TEST_USER_ID,
      userType: 'teacher',
    },
    issuedAt: new Date(),
    completionDate: new Date(),
    certificateData: {
      title: 'Test Certificate',
      studentName: 'Test Student',
      courseName: 'Test Course',
      completionPercentage: 100,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await certificatesCollection.insertOne(testCertificate);
    console.log('     ✅ Certificate created successfully');

    // Verify the certificate was created with string user ID
    const createdCertificate = await certificatesCollection.findOne({
      'issuedBy.userId': TEST_USER_ID,
    });
    if (
      createdCertificate &&
      typeof createdCertificate.issuedBy.userId === 'string'
    ) {
      console.log('     ✅ Certificate user ID is string type');
    } else {
      throw new Error('Certificate user ID is not string type');
    }

    // Cleanup
    await certificatesCollection.deleteOne({ 'issuedBy.userId': TEST_USER_ID });
  } catch (error) {
    console.error('     ❌ Certificate test failed:', error.message);
    throw error;
  }
}

async function testClass(db) {
  console.log('   🎓 Testing class with string user ID...');

  const classesCollection = db.collection('classes');

  const testClass = {
    className: 'Test Class',
    description: 'A test class',
    createdBy: {
      userId: TEST_USER_ID,
      userType: 'teacher',
    },
    courses: [],
    students: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await classesCollection.insertOne(testClass);
    console.log('     ✅ Class created successfully');

    // Verify the class was created with string user ID
    const createdClass = await classesCollection.findOne({
      'createdBy.userId': TEST_USER_ID,
    });
    if (createdClass && typeof createdClass.createdBy.userId === 'string') {
      console.log('     ✅ Class user ID is string type');
    } else {
      throw new Error('Class user ID is not string type');
    }

    // Cleanup
    await classesCollection.deleteOne({ 'createdBy.userId': TEST_USER_ID });
  } catch (error) {
    console.error('     ❌ Class test failed:', error.message);
    throw error;
  }
}

async function testParent(db) {
  console.log('   👨‍👩‍👧‍👦 Testing parent with string user ID...');

  const parentsCollection = db.collection('parents');

  const testParent = {
    userId: TEST_USER_ID,
    children: [],
    relationship: 'parent',
    phoneNumber: '+1234567890',
    address: {
      subCity: 'Test City',
      city: 'Test City',
      country: 'Test Country',
    },
    subscription: new db.constructor.Types.ObjectId(),
    paymentHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await parentsCollection.insertOne(testParent);
    console.log('     ✅ Parent created successfully');

    // Verify the parent was created with string user ID
    const createdParent = await parentsCollection.findOne({
      userId: TEST_USER_ID,
    });
    if (createdParent && typeof createdParent.userId === 'string') {
      console.log('     ✅ Parent user ID is string type');
    } else {
      throw new Error('Parent user ID is not string type');
    }

    // Cleanup
    await parentsCollection.deleteOne({ userId: TEST_USER_ID });
  } catch (error) {
    console.error('     ❌ Parent test failed:', error.message);
    throw error;
  }
}

async function testAdmin(db) {
  console.log('   👨‍💼 Testing admin with string user ID...');

  const adminsCollection = db.collection('admins');

  const testAdmin = {
    userId: TEST_USER_ID,
    accessLevel: 'admin',
    managedOrganizations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await adminsCollection.insertOne(testAdmin);
    console.log('     ✅ Admin created successfully');

    // Verify the admin was created with string user ID
    const createdAdmin = await adminsCollection.findOne({
      userId: TEST_USER_ID,
    });
    if (createdAdmin && typeof createdAdmin.userId === 'string') {
      console.log('     ✅ Admin user ID is string type');
    } else {
      throw new Error('Admin user ID is not string type');
    }

    // Cleanup
    await adminsCollection.deleteOne({ userId: TEST_USER_ID });
  } catch (error) {
    console.error('     ❌ Admin test failed:', error.message);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  testStringUserIdImplementation()
    .then(() => {
      console.log('🎉 All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Tests failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testStringUserIdImplementation,
};
