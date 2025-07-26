/**
 * Database Migration Script: Update User IDs to String Format
 *
 * This script migrates existing user documents and their references
 * from ObjectId format to string format for better-auth compatibility.
 *
 * Usage: node scripts/migrate-user-ids.js
 */

const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/beblocky-api';
const DB_NAME = process.env.DB_NAME || 'beblocky-api';

async function migrateUserIds() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('📊 Starting user ID migration...');

    // Step 1: Backup existing data
    console.log('💾 Creating backup...');
    await createBackup(db);

    // Step 2: Update user documents
    console.log('👤 Updating user documents...');
    await updateUserDocuments(db);

    // Step 3: Update references in other collections
    console.log('🔄 Updating references in other collections...');
    await updateCollectionReferences(db, 'subscriptions');
    await updateCollectionReferences(db, 'payments');
    await updateCollectionReferences(db, 'certificates');
    await updateCollectionReferences(db, 'classes');
    await updateCollectionReferences(db, 'course_ratings');
    await updateCollectionReferences(db, 'parents');
    await updateCollectionReferences(db, 'admins');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function createBackup(db) {
  const collections = [
    'users',
    'subscriptions',
    'payments',
    'certificates',
    'classes',
    'course_ratings',
    'parents',
    'admins',
  ];

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const backupCollection = db.collection(
      `${collectionName}_backup_${Date.now()}`,
    );

    const documents = await collection.find({}).toArray();
    if (documents.length > 0) {
      await backupCollection.insertMany(documents);
      console.log(
        `   📋 Backed up ${documents.length} documents from ${collectionName}`,
      );
    }
  }
}

async function updateUserDocuments(db) {
  const usersCollection = db.collection('users');

  // Find all users with ObjectId _id
  const users = await usersCollection
    .find({
      _id: { $type: 'objectId' },
    })
    .toArray();

  console.log(`   Found ${users.length} users with ObjectId _id`);

  for (const user of users) {
    const oldId = user._id.toString();

    // Generate a new string ID (you might want to use better-auth format)
    const newId = generateStringId(oldId);

    // Create new document with string _id
    const newUser = {
      ...user,
      _id: newId,
    };

    // Insert new document
    await usersCollection.insertOne(newUser);

    // Store mapping for reference updates
    await db.collection('id_mappings').insertOne({
      oldId: oldId,
      newId: newId,
      collection: 'users',
      migratedAt: new Date(),
    });

    console.log(`   ✅ Migrated user: ${oldId} -> ${newId}`);
  }
}

async function updateCollectionReferences(db, collectionName) {
  const collection = db.collection(collectionName);
  const mappings = await db.collection('id_mappings').find({}).toArray();

  console.log(`   🔄 Updating ${collectionName}...`);

  for (const mapping of mappings) {
    const { oldId, newId } = mapping;

    // Update direct userId references
    await collection.updateMany({ userId: oldId }, { $set: { userId: newId } });

    // Update nested userId references (e.g., createdBy.userId, issuedBy.userId)
    await collection.updateMany(
      { 'createdBy.userId': oldId },
      { $set: { 'createdBy.userId': newId } },
    );

    await collection.updateMany(
      { 'issuedBy.userId': oldId },
      { $set: { 'issuedBy.userId': newId } },
    );

    console.log(`     ✅ Updated references: ${oldId} -> ${newId}`);
  }
}

function generateStringId(objectId) {
  // This is a simple conversion - you might want to use better-auth's format
  // For now, we'll use a base64-like string
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${random}`.toUpperCase();
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'migrate':
      migrateUserIds()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error('Migration failed:', error);
          process.exit(1);
        });
      break;

    default:
      console.log(`
Usage: node scripts/migrate-user-ids.js <command>

Commands:
  migrate   - Run the migration

Example:
  node scripts/migrate-user-ids.js migrate
      `);
  }
}

module.exports = {
  migrateUserIds,
};
