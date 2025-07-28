const mongoose = require('mongoose');

async function testUserExists() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beblocky';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Test with a sample user ID (you can change this)
    const testUserId = 'dceYvGkCHG3y9cKv2EiGEZhKUwyXQ7Wl';

    console.log(`🔍 Checking if user with ID "${testUserId}" exists...`);

    const user = await usersCollection.findOne({ _id: testUserId });

    if (user) {
      console.log('✅ User found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ User not found');

      // Check if there are any users at all
      const allUsers = await usersCollection.find({}).limit(5).toArray();
      console.log(`\n📋 Found ${allUsers.length} users in database:`);
      allUsers.forEach((u, index) => {
        console.log(
          `  ${index + 1}. _id: ${u._id}, email: ${u.email}, name: ${u.name}`,
        );
      });
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testUserExists();
