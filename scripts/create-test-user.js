const mongoose = require('mongoose');

async function createTestUser() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beblocky';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const testUser = {
      _id: 'gDCFEQbQEc45KfxCOkYp2WJiuSHmmv5G',
      email: 'teacher@beblocky.com',
      name: 'Test Teacher',
      emailVerified: true,
      role: 'teacher',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('📝 Creating test user...');
    console.log(JSON.stringify(testUser, null, 2));

    const result = await usersCollection.insertOne(testUser);
    console.log('✅ Test user created successfully!');
    console.log('Inserted ID:', result.insertedId);

    // Verify the user was created
    const createdUser = await usersCollection.findOne({ _id: testUser._id });
    console.log('\n📋 Created user:');
    console.log(JSON.stringify(createdUser, null, 2));
  } catch (error) {
    if (error.code === 11000) {
      console.log('ℹ️  User already exists, skipping creation');
    } else {
      console.error('❌ Failed to create test user:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestUser();
