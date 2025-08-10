const mongoose = require('mongoose');
require('dotenv').config();

async function checkTeachers() {
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

    // Check all teachers
    console.log('\n📋 All teachers in database:');
    const teachers = await teachersCollection.find({}).toArray();
    console.log(`Total teachers: ${teachers.length}`);

    if (teachers.length > 0) {
      teachers.forEach((teacher, index) => {
        console.log(`\n${index + 1}. Teacher ID: ${teacher._id}`);
        console.log(`   User ID: ${teacher.userId}`);
        console.log(
          `   Organization ID: ${teacher.organizationId || 'NOT SET'}`,
        );
        console.log(
          `   Courses: ${teacher.courses ? teacher.courses.length : 0}`,
        );
        console.log(`   Created: ${teacher.createdAt}`);
      });
    }

    // Check organizations collection for reference
    console.log('\n📋 Available organizations:');
    const organizationsCollection = db.collection('organizations');
    const organizations = await organizationsCollection.find({}).toArray();
    console.log(`Total organizations: ${organizations.length}`);

    if (organizations.length > 0) {
      organizations.forEach((org, index) => {
        console.log(`\n${index + 1}. Organization ID: ${org._id}`);
        console.log(`   Name: ${org.name || 'NOT SET'}`);
        console.log(`   User ID: ${org.userId}`);
      });
    }
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the check
checkTeachers();
