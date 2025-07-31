const mongoose = require('mongoose');

async function checkAllCollections() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beblocky';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    console.log('Database URI:', uri);
    console.log('Database name:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;

    // List all collections
    console.log('\n📋 All collections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach((collection) => {
      console.log(`  - ${collection.name}`);
    });

    // Check users collection specifically
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

    // Check teachers collection
    console.log('\n📋 Checking teachers collection:');
    const teachersCollection = db.collection('teachers');
    const teacherCount = await teachersCollection.countDocuments();
    console.log(`Total teachers: ${teacherCount}`);

    if (teacherCount > 0) {
      const teachers = await teachersCollection.find({}).limit(3).toArray();
      console.log('\n📋 Sample teachers:');
      teachers.forEach((teacher, index) => {
        console.log(
          `  ${index + 1}. _id: ${teacher._id}, userId: ${teacher.userId}`,
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
    }
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the check
checkAllCollections();
