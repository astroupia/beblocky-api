const mongoose = require('mongoose');
require('dotenv').config();

async function checkProductionDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI environment variable not found!');
    console.log('Please make sure you have MONGO_URI set in your environment.');
    return;
  }

  console.log(
    '🔗 Connecting to:',
    uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
  ); // Hide credentials

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    console.log('Database name:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;

    // Check users collection
    console.log('\n📋 Checking users collection:');
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`Total users: ${userCount}`);

    if (userCount > 0) {
      const users = await usersCollection.find({}).limit(5).toArray();
      console.log('\n📋 Sample users:');
      users.forEach((user, index) => {
        console.log(
          `  ${index + 1}. _id: ${user._id}, email: ${user.email}, name: ${user.name}`,
        );
      });
    }

    // Check for the specific user
    const specificUser = await usersCollection.findOne({
      _id: 'dceYvGkCHG3y9cKv2EiGEZhKUwyXQ7Wl',
    });
    if (specificUser) {
      console.log('\n✅ Found the specific user:');
      console.log(JSON.stringify(specificUser, null, 2));
    } else {
      console.log('\n❌ Specific user not found');

      // Check if there are any users with similar IDs
      const similarUsers = await usersCollection
        .find({
          _id: { $regex: /dceYvGkCHG3y9cKv2EiGEZhKUwyXQ7Wl/ },
        })
        .toArray();
      console.log(`\n📋 Users with similar IDs: ${similarUsers.length}`);
    }

    // Check teachers collection
    console.log('\n📋 Checking teachers collection:');
    const teachersCollection = db.collection('teachers');
    const teacherCount = await teachersCollection.countDocuments();
    console.log(`Total teachers: ${teacherCount}`);

    // Check for email index
    console.log('\n📋 Checking indexes on teachers collection:');
    const indexes = await teachersCollection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the check
checkProductionDB();
