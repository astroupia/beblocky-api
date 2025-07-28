const mongoose = require('mongoose');
require('dotenv').config();

async function checkAllEmailIndexes() {
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

    // Collections to check for email indexes
    const collectionsToCheck = [
      'admins',
      'students',
      'organizations',
      'parents',
      'teachers', // Already fixed, but let's verify
    ];

    console.log('\n📋 Checking all collections for email indexes:');
    console.log('='.repeat(60));

    for (const collectionName of collectionsToCheck) {
      console.log(`\n🔍 Checking ${collectionName} collection:`);

      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();

        console.log(`  📊 Total indexes: ${indexes.length}`);

        // Check for email-related indexes
        const emailIndexes = indexes.filter((index) =>
          Object.keys(index.key).some((key) => key.includes('email')),
        );

        if (emailIndexes.length > 0) {
          console.log(
            `  ⚠️  Found ${emailIndexes.length} email-related index(es):`,
          );
          emailIndexes.forEach((index) => {
            console.log(`    - ${index.name}: ${JSON.stringify(index.key)}`);
          });
        } else {
          console.log(`  ✅ No email indexes found`);
        }

        // Show all indexes for reference
        console.log(`  📋 All indexes:`);
        indexes.forEach((index) => {
          console.log(`    - ${index.name}: ${JSON.stringify(index.key)}`);
        });
      } catch (error) {
        console.log(`  ❌ Error checking ${collectionName}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 Summary:');
    console.log('- Look for any "email_1" or similar email indexes');
    console.log(
      '- These should be removed if the entity no longer has an email field',
    );
    console.log('- Only userId indexes should remain for user references');
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the check
checkAllEmailIndexes();
