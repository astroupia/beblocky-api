const mongoose = require('mongoose');
require('dotenv').config();

async function fixStudentEmailIndex() {
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
    const studentsCollection = db.collection('students');

    // List all indexes first
    console.log('\n📋 Current indexes on students collection:');
    const indexes = await studentsCollection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop the problematic email index
    try {
      await studentsCollection.dropIndex('email_1');
      console.log('\n✅ Dropped email_1 index');
    } catch (error) {
      if (error.code === 26) {
        console.log('\nℹ️  email_1 index does not exist, skipping...');
      } else {
        console.log('\n⚠️  Error dropping email_1 index:', error.message);
      }
    }

    // Create the new userId index (if it doesn't exist)
    try {
      await studentsCollection.createIndex({ userId: 1 }, { unique: true });
      console.log('✅ Created userId_1 unique index');
    } catch (error) {
      console.log('⚠️  Error creating userId index:', error.message);
    }

    // Create other useful indexes
    try {
      await studentsCollection.createIndex({ schoolId: 1 });
      console.log('✅ Created schoolId_1 index');
    } catch (error) {
      console.log('⚠️  Error creating schoolId index:', error.message);
    }

    try {
      await studentsCollection.createIndex({ parentId: 1 });
      console.log('✅ Created parentId_1 index');
    } catch (error) {
      console.log('⚠️  Error creating parentId index:', error.message);
    }

    try {
      await studentsCollection.createIndex({ enrolledCourses: 1 });
      console.log('✅ Created enrolledCourses_1 index');
    } catch (error) {
      console.log('⚠️  Error creating enrolledCourses index:', error.message);
    }

    // List final indexes
    console.log('\n📋 Final indexes on students collection:');
    const finalIndexes = await studentsCollection.indexes();
    finalIndexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n🎉 Student index migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixStudentEmailIndex();
