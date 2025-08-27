require('dotenv').config();
const mongoose = require('mongoose');

async function testUserListener() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/beblocky';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const teachersCollection = db.collection('teachers');
    const studentsCollection = db.collection('students');
    const parentsCollection = db.collection('parents');
    const adminsCollection = db.collection('admins');
    const organizationsCollection = db.collection('organizations');

    // Test user data with Better-Auth format user IDs (base64-encoded)
    const testUsers = [
      {
        _id: Buffer.from('test-teacher-' + Date.now()).toString('base64'),
        email: 'test-teacher@beblocky.com',
        name: 'Test Teacher',
        emailVerified: true,
        role: 'teacher',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: Buffer.from('test-student-' + Date.now()).toString('base64'),
        email: 'test-student@beblocky.com',
        name: 'Test Student',
        emailVerified: true,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: Buffer.from('test-parent-' + Date.now()).toString('base64'),
        email: 'test-parent@beblocky.com',
        name: 'Test Parent',
        emailVerified: true,
        role: 'parent',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log('🧪 Testing User Listener...\n');

    for (const testUser of testUsers) {
      console.log(
        `📝 Creating test user: ${testUser.email} (${testUser.role})`,
      );

      // Create the user
      await usersCollection.insertOne(testUser);
      console.log(`✅ User created: ${testUser._id}`);

      // Wait a bit for the listener to process
      console.log('⏳ Waiting for listener to process...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if role-specific instance was created
      let roleInstance = null;
      switch (testUser.role) {
        case 'teacher':
          roleInstance = await teachersCollection.findOne({
            userId: testUser._id,
          });
          break;
        case 'student':
          roleInstance = await studentsCollection.findOne({
            userId: testUser._id,
          });
          break;
        case 'parent':
          roleInstance = await parentsCollection.findOne({
            userId: testUser._id,
          });
          break;
        case 'admin':
          roleInstance = await adminsCollection.findOne({
            userId: testUser._id,
          });
          break;
        case 'organization':
          roleInstance = await organizationsCollection.findOne({
            userId: testUser._id,
          });
          break;
      }

      if (roleInstance) {
        console.log(`✅ ${testUser.role} instance created successfully!`);
        console.log(`   Instance ID: ${roleInstance._id}`);
      } else {
        console.log(`❌ ${testUser.role} instance was NOT created`);
      }

      console.log('---\n');
    }

    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    for (const testUser of testUsers) {
      await usersCollection.deleteOne({ _id: testUser._id });

      switch (testUser.role) {
        case 'teacher':
          await teachersCollection.deleteOne({ userId: testUser._id });
          break;
        case 'student':
          await studentsCollection.deleteOne({ userId: testUser._id });
          break;
        case 'parent':
          await parentsCollection.deleteOne({ userId: testUser._id });
          break;
        case 'admin':
          await adminsCollection.deleteOne({ userId: testUser._id });
          break;
        case 'organization':
          await organizationsCollection.deleteOne({ userId: testUser._id });
          break;
      }
    }
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testUserListener();
