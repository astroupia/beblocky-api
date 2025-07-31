const mongoose = require('mongoose');
require('dotenv').config();

async function fixTeacherEmailIndex() {
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
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const teachersCollection = db.collection('teachers');

    // List all indexes first
    console.log('📋 Current indexes on teachers collection:');
    const indexes = await teachersCollection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop the problematic email index
    try {
      await teachersCollection.dropIndex('email_1');
      console.log('✅ Dropped email_1 index');
    } catch (error) {
      if (error.code === 26) {
        console.log('ℹ️  email_1 index does not exist, skipping...');
      } else {
        console.log('⚠️  Error dropping email_1 index:', error.message);
      }
    }

    // Drop any other email-related indexes
    try {
      await teachersCollection.dropIndex('email_-1');
      console.log('✅ Dropped email_-1 index');
    } catch (error) {
      if (error.code === 26) {
        console.log('ℹ️  email_-1 index does not exist, skipping...');
      } else {
        console.log('⚠️  Error dropping email_-1 index:', error.message);
      }
    }

    // Create the new userId index
    try {
      await teachersCollection.createIndex({ userId: 1 }, { unique: true });
      console.log('✅ Created userId_1 unique index');
    } catch (error) {
      console.log('⚠️  Error creating userId index:', error.message);
    }

    // Create other useful indexes
    try {
      await teachersCollection.createIndex({ organizationId: 1 });
      console.log('✅ Created organizationId_1 index');
    } catch (error) {
      console.log('⚠️  Error creating organizationId index:', error.message);
    }

    try {
      await teachersCollection.createIndex({ courses: 1 });
      console.log('✅ Created courses_1 index');
    } catch (error) {
      console.log('⚠️  Error creating courses index:', error.message);
    }

    // List final indexes
    console.log('\n📋 Final indexes on teachers collection:');
    const finalIndexes = await teachersCollection.indexes();
    finalIndexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n🎉 Teacher index migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixTeacherEmailIndex();
