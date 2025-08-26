require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlasConnection() {
  const uri =
    process.env.MONGO_URI ||
    'mongodb+srv://beblokcy-admin:t20u8yJnxJc5YfE2@beblocky-dashboard.tnby5.mongodb.net/beblocky?retryWrites=true&w=majority&appName=beblocky-Dashboard';

  if (!uri) {
    console.error('❌ MONGO_URI environment variable is not set');
    return;
  }

  console.log('🔗 Testing MongoDB Atlas connection...');
  console.log(
    '📋 Connection string format:',
    uri.includes('mongodb+srv') ? '✅ Atlas (Replica Set)' : '❌ Standalone',
  );

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;
    const adminDb = db.admin();

    // Check if this is a replica set
    try {
      const replStatus = await adminDb.command({ replSetGetStatus: 1 });
      console.log('✅ Confirmed: MongoDB is running as a REPLICA SET');
      console.log('📋 Replica Set Name:', replStatus.set);
      console.log('👥 Members:', replStatus.members.length);
      console.log(
        '🎯 Primary:',
        replStatus.members.find((m) => m.state === 1)?.name || 'Unknown',
      );
      console.log('📊 Change streams should work!');
    } catch (error) {
      console.log('❌ Could not get replica set status:', error.message);
    }

    // Test change streams
    try {
      const collections = await db.listCollections().toArray();
      if (collections.length > 0) {
        const testCollection = collections[0];
        console.log(
          `🧪 Testing change stream on collection: ${testCollection.name}`,
        );

        const changeStream = db.collection(testCollection.name).watch();
        console.log('✅ Change stream created successfully');

        // Test if change stream is working
        setTimeout(async () => {
          try {
            await changeStream.close();
            console.log('✅ Change stream closed successfully');
          } catch (error) {
            console.log('❌ Error closing change stream:', error.message);
          }
        }, 1000);
      } else {
        console.log('⚠️ No collections found to test change streams');
      }
    } catch (error) {
      console.log('❌ Change streams test failed:', error.message);
    }

    // Test inserting a document to see if change stream detects it
    try {
      const testCollection = db.collection('test_change_stream');
      console.log('🧪 Testing change stream with document insertion...');

      const changeStream = testCollection.watch();

      // Insert a test document
      const testDoc = { test: true, timestamp: new Date() };
      await testCollection.insertOne(testDoc);
      console.log('✅ Test document inserted');

      // Wait for change stream to detect it
      setTimeout(async () => {
        try {
          await changeStream.close();
          await testCollection.deleteOne(testDoc);
          console.log('✅ Change stream test completed');
        } catch (error) {
          console.log('❌ Error in change stream test:', error.message);
        }
      }, 2000);
    } catch (error) {
      console.log('❌ Change stream insertion test failed:', error.message);
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
    console.log('💡 Make sure your connection string is correct and includes:');
    console.log('   - mongodb+srv:// protocol');
    console.log('   - Correct username and password');
    console.log('   - Correct cluster URL');
    console.log('   - Database name');
  } finally {
    setTimeout(async () => {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB Atlas');
    }, 3000);
  }
}

testAtlasConnection();
