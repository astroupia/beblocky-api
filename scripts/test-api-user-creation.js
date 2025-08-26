require('dotenv').config();
const mongoose = require('mongoose');

async function testApiUserCreation() {
  const uri =
    process.env.MONGO_URI ||
    'mongodb+srv://beblokcy-admin:t20u8yJnxJc5YfE2@beblocky-dashboard.tnby5.mongodb.net/beblocky?retryWrites=true&w=majority&appName=beblocky-Dashboard';

  try {
    await mongoose.connect(uri);
    console.log('🔗 Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const studentsCollection = db.collection('students');
    const teachersCollection = db.collection('teachers');
    const parentsCollection = db.collection('parents');

    console.log('🧪 Testing User Listener with Database Insertion...\n');

    // Test user data with Better-Auth format user IDs (base64-encoded)
    const testUsers = [
      {
        _id: Buffer.from('api-test-teacher-' + Date.now()).toString('base64'),
        email: 'api-test-teacher@beblocky.com',
        name: 'API Test Teacher',
        emailVerified: true,
        role: 'teacher',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: Buffer.from('api-test-student-' + Date.now()).toString('base64'),
        email: 'api-test-student@beblocky.com',
        name: 'API Test Student',
        emailVerified: true,
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: Buffer.from('api-test-parent-' + Date.now()).toString('base64'),
        email: 'api-test-parent@beblocky.com',
        name: 'API Test Parent',
        emailVerified: true,
        role: 'parent',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const testUser of testUsers) {
      console.log(
        `📝 Creating user in database: ${testUser.email} (${testUser.role})`,
      );

      try {
        // Insert user directly into database
        await usersCollection.insertOne(testUser);
        console.log(`✅ User inserted in database: ${testUser._id}`);

        // Wait for listener to process
        console.log('⏳ Waiting for listener to process...');
        await new Promise((resolve) => setTimeout(resolve, 3000));

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
        }

        if (roleInstance) {
          console.log(`✅ ${testUser.role} instance created successfully!`);
          console.log(`   Instance ID: ${roleInstance._id}`);
        } else {
          console.log(`❌ ${testUser.role} instance was NOT created`);

          // Check if any instances exist
          const allInstances = await db
            .collection(testUser.role + 's')
            .find({})
            .toArray();
          console.log(
            `📊 Total ${testUser.role}s in collection: ${allInstances.length}`,
          );
        }

        // Clean up
        await usersCollection.deleteOne({ _id: testUser._id });
        if (roleInstance) {
          await db
            .collection(testUser.role + 's')
            .deleteOne({ userId: testUser._id });
        }
        console.log(`🗑️ Cleaned up: ${testUser._id}`);
      } catch (error) {
        console.error(`❌ Error with ${testUser.role}:`, error.message);
      }

      console.log('---\n');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testApiUserCreation();
