const { MongoClient } = require('mongodb');

async function fixDuplicateSessionIds() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beblocky';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const paymentsCollection = db.collection('payments');

    // Find all payments with null sessionId
    const nullSessionPayments = await paymentsCollection
      .find({ sessionId: null })
      .toArray();
    console.log(
      `Found ${nullSessionPayments.length} payments with null sessionId`,
    );

    if (nullSessionPayments.length > 1) {
      // Keep the first one, delete the rest
      const toDelete = nullSessionPayments.slice(1);
      console.log(`Will delete ${toDelete.length} duplicate payments`);

      for (const payment of toDelete) {
        console.log(`Deleting payment with _id: ${payment._id}`);
        await paymentsCollection.deleteOne({ _id: payment._id });
      }

      console.log('Successfully cleaned up duplicate null sessionId payments');
    } else {
      console.log('No duplicate null sessionId payments found');
    }

    // Also clean up any payments with empty string sessionId
    const emptySessionPayments = await paymentsCollection
      .find({ sessionId: '' })
      .toArray();
    console.log(
      `Found ${emptySessionPayments.length} payments with empty sessionId`,
    );

    if (emptySessionPayments.length > 0) {
      for (const payment of emptySessionPayments) {
        console.log(
          `Deleting payment with empty sessionId, _id: ${payment._id}`,
        );
        await paymentsCollection.deleteOne({ _id: payment._id });
      }
    }
  } catch (error) {
    console.error('Error fixing duplicate sessionIds:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixDuplicateSessionIds().catch(console.error);
