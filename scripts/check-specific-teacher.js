const mongoose = require('mongoose');
require('dotenv').config();

async function checkSpecificTeacher() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI environment variable not found!');
    return;
  }

  console.log('🔗 Connecting to production database...');

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const teachersCollection = db.collection('teachers');

    const targetUserId = 'hjlLRzNPCKvAhh4ETHN4OtZ2dlzpMa4h';

    console.log(`\n🔍 Searching for teacher with userId: ${targetUserId}`);

    // Search by userId
    const teacher = await teachersCollection.findOne({ userId: targetUserId });

    if (teacher) {
      console.log('✅ Teacher found!');
      console.log('\n📋 Teacher details:');
      console.log(`   _id: ${teacher._id}`);
      console.log(`   userId: ${teacher.userId}`);
      console.log(`   organizationId: ${teacher.organizationId || 'NOT SET'}`);
      console.log(
        `   courses: ${teacher.courses ? teacher.courses.length : 0}`,
      );
      console.log(`   createdAt: ${teacher.createdAt}`);
      console.log(`   updatedAt: ${teacher.updatedAt}`);

      // Check if there are any other fields
      console.log('\n📋 All fields in teacher document:');
      Object.keys(teacher).forEach((key) => {
        console.log(`   ${key}: ${JSON.stringify(teacher[key])}`);
      });
    } else {
      console.log('❌ Teacher not found with that userId');

      // Let's check all teachers to see what userIds exist
      console.log('\n📋 All existing teachers:');
      const allTeachers = await teachersCollection.find({}).toArray();
      allTeachers.forEach((t, index) => {
        console.log(`${index + 1}. userId: ${t.userId} (ID: ${t._id})`);
      });
    }

    // Also check if there's a user with this ID
    console.log('\n🔍 Checking if user exists with this ID...');
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: targetUserId });

    if (user) {
      console.log('✅ User found!');
      console.log(`   _id: ${user._id}`);
      console.log(`   email: ${user.email}`);
      console.log(`   name: ${user.name}`);
    } else {
      console.log('❌ User not found with this ID');
    }
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the check
checkSpecificTeacher();
