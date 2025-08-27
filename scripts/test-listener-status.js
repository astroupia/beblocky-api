require('dotenv').config();
const mongoose = require('mongoose');

async function testListenerStatus() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/beblocky';

  try {
    await mongoose.connect(uri);
    console.log('🔗 Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const studentsCollection = db.collection('students');
    const teachersCollection = db.collection('teachers');
    const parentsCollection = db.collection('parents');

    console.log('\n🧪 Testing User Listener Status...\n');

    // Check current collections
    const userCount = await usersCollection.countDocuments();
    const studentCount = await studentsCollection.countDocuments();
    const teacherCount = await teachersCollection.countDocuments();
    const parentCount = await parentsCollection.countDocuments();

    console.log('📊 Current Collection Counts:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Teachers: ${teacherCount}`);
    console.log(`   Parents: ${parentCount}`);

    // Check for any duplicate userIds
    console.log('\n🔍 Checking for duplicate userIds...');

    const duplicateStudents = await studentsCollection
      .aggregate([
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            docs: { $push: '$_id' },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .toArray();

    const duplicateTeachers = await teachersCollection
      .aggregate([
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            docs: { $push: '$_id' },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .toArray();

    const duplicateParents = await parentsCollection
      .aggregate([
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            docs: { $push: '$_id' },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .toArray();

    if (duplicateStudents.length > 0) {
      console.log('❌ Found duplicate students:');
      duplicateStudents.forEach((dup) => {
        console.log(`   userId: ${dup._id} (${dup.count} instances)`);
      });
    } else {
      console.log('✅ No duplicate students found');
    }

    if (duplicateTeachers.length > 0) {
      console.log('❌ Found duplicate teachers:');
      duplicateTeachers.forEach((dup) => {
        console.log(`   userId: ${dup._id} (${dup.count} instances)`);
      });
    } else {
      console.log('✅ No duplicate teachers found');
    }

    if (duplicateParents.length > 0) {
      console.log('❌ Found duplicate parents:');
      duplicateParents.forEach((dup) => {
        console.log(`   userId: ${dup._id} (${dup.count} instances)`);
      });
    } else {
      console.log('✅ No duplicate parents found');
    }

    // Test creating a new user to see if listener works
    console.log('\n🧪 Testing new user creation...');

    const testUserId = Buffer.from('test-listener-' + Date.now()).toString(
      'base64',
    );
    const testUser = {
      _id: testUserId,
      email: `test-listener-${Date.now()}@beblocky.com`,
      name: 'Test Listener User',
      emailVerified: true,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Insert test user
      await usersCollection.insertOne(testUser);
      console.log(`✅ Test user created: ${testUserId}`);

      // Wait for listener to process
      console.log('⏳ Waiting for listener to process...');
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if student was created
      const createdStudent = await studentsCollection.findOne({
        userId: testUserId,
      });
      if (createdStudent) {
        console.log(`✅ Student instance created successfully!`);
        console.log(`   Student ID: ${createdStudent._id}`);
      } else {
        console.log(`❌ Student instance was NOT created`);
      }

      // Clean up
      await usersCollection.deleteOne({ _id: testUserId });
      if (createdStudent) {
        await studentsCollection.deleteOne({ userId: testUserId });
      }
      console.log(`🗑️ Cleaned up test user: ${testUserId}`);
    } catch (error) {
      console.error('❌ Error during test:', error.message);

      // Clean up on error
      try {
        await usersCollection.deleteOne({ _id: testUserId });
        await studentsCollection.deleteOne({ userId: testUserId });
        console.log(`🗑️ Cleaned up after error: ${testUserId}`);
      } catch (cleanupError) {
        console.log('⚠️ Could not clean up test data');
      }
    }

    // Check indexes
    console.log('\n🔍 Checking database indexes...');

    const studentIndexes = await studentsCollection.indexes();
    const teacherIndexes = await teachersCollection.indexes();
    const parentIndexes = await parentsCollection.indexes();

    console.log('📋 Student indexes:');
    studentIndexes.forEach((index) => {
      console.log(`   ${JSON.stringify(index.key)}`);
    });

    console.log('📋 Teacher indexes:');
    teacherIndexes.forEach((index) => {
      console.log(`   ${JSON.stringify(index.key)}`);
    });

    console.log('📋 Parent indexes:');
    parentIndexes.forEach((index) => {
      console.log(`   ${JSON.stringify(index.key)}`);
    });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testListenerStatus();
