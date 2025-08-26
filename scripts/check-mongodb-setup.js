require('dotenv').config();
const mongoose = require('mongoose');

async function checkMongoDBSetup() {
  const uri = process.env.MONGO_URI;

  try {
    await mongoose.connect(uri);
    console.log('🔗 Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;
    const adminDb = db.admin();

    // Check if this is a replica set
    try {
      const replStatus = await adminDb.command({ replSetGetStatus: 1 });
      console.log('✅ MongoDB is running as a REPLICA SET');
      console.log('📋 Replica Set Name:', replStatus.set);
      console.log('👥 Members:', replStatus.members.length);
      console.log(
        '🎯 Primary:',
        replStatus.members.find((m) => m.state === 1)?.name || 'Unknown',
      );
      console.log('📊 Change streams should work!');
    } catch (error) {
      if (error.code === 76) {
        console.log('❌ MongoDB is running as a STANDALONE instance');
        console.log(
          '⚠️ Change streams require a replica set or sharded cluster',
        );
        console.log('🔧 To fix this, you need to:');
        console.log('   1. Set up a MongoDB replica set');
        console.log(
          '   2. Or use MongoDB Atlas (which has replica sets by default)',
        );
        console.log(
          '   3. Or modify your listener to use a different approach',
        );
      } else {
        console.log('❓ Could not determine MongoDB setup:', error.message);
      }
    }

    // Check if change streams are supported
    try {
      const collections = await db.listCollections().toArray();
      if (collections.length > 0) {
        const testCollection = collections[0];
        const changeStream = db.collection(testCollection.name).watch();
        console.log('✅ Change streams are supported on this MongoDB instance');
        await changeStream.close();
      }
    } catch (error) {
      console.log('❌ Change streams are NOT supported:', error.message);
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkMongoDBSetup();
