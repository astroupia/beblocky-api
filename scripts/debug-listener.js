require('dotenv').config();
const mongoose = require('mongoose');

async function debugListener() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/beblocky';

  try {
    await mongoose.connect(uri);
    console.log('🔗 Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if collection exists and has documents
    const userCount = await usersCollection.countDocuments();
    console.log(`📈 Users collection has ${userCount} documents`);

    // Create a simple test user
    const testUser = {
      _id: 'debug-test-' + Date.now(),
      email: 'debug-test@beblocky.com',
      name: 'Debug Test User',
      emailVerified: true,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('\n🧪 Creating test user...');
    console.log('User ID:', testUser._id);
    console.log('User Role:', testUser.role);

    // Insert the user
    await usersCollection.insertOne(testUser);
    console.log('✅ User inserted successfully');

    // Wait and check if user exists
    console.log('⏳ Waiting 3 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check if user still exists
    const insertedUser = await usersCollection.findOne({ _id: testUser._id });
    if (insertedUser) {
      console.log('✅ User still exists in database');
      console.log('User data:', JSON.stringify(insertedUser, null, 2));
    } else {
      console.log('❌ User not found in database');
    }

    // Check if student instance was created
    const studentsCollection = db.collection('students');
    const studentInstance = await studentsCollection.findOne({
      userId: testUser._id,
    });

    if (studentInstance) {
      console.log('✅ Student instance created!');
      console.log('Student ID:', studentInstance._id);
    } else {
      console.log('❌ No student instance found');

      // Check all students to see if any exist
      const allStudents = await studentsCollection.find({}).toArray();
      console.log(`📊 Total students in collection: ${allStudents.length}`);
      if (allStudents.length > 0) {
        console.log('Sample student:', JSON.stringify(allStudents[0], null, 2));
      }
    }

    // Clean up
    console.log('\n🧹 Cleaning up...');
    await usersCollection.deleteOne({ _id: testUser._id });
    if (studentInstance) {
      await studentsCollection.deleteOne({ userId: testUser._id });
    }
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugListener();
