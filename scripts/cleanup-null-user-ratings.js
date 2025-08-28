require('dotenv').config();
const mongoose = require('mongoose');

async function cleanupNullUserRatings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('course_ratings');

    // Find ratings with null userId
    const nullUserRatings = await collection.find({ userId: null }).toArray();
    console.log(`📊 Found ${nullUserRatings.length} ratings with null userId`);

    if (nullUserRatings.length > 0) {
      console.log('🗑️  Deleting ratings with null userId...');

      // Delete ratings with null userId
      const result = await collection.deleteMany({ userId: null });
      console.log(`✅ Deleted ${result.deletedCount} ratings with null userId`);

      console.log('📋 Deleted ratings details:');
      nullUserRatings.forEach((rating, index) => {
        console.log(
          `  ${index + 1}. Course: ${rating.courseId}, Rating: ${rating.rating}, Review: ${rating.review || 'N/A'}`,
        );
      });
    } else {
      console.log('✅ No ratings with null userId found');
    }

    // Also check for ratings with undefined userId
    const undefinedUserRatings = await collection
      .find({ userId: { $exists: false } })
      .toArray();
    console.log(
      `📊 Found ${undefinedUserRatings.length} ratings with undefined userId`,
    );

    if (undefinedUserRatings.length > 0) {
      console.log('🗑️  Deleting ratings with undefined userId...');

      const result = await collection.deleteMany({
        userId: { $exists: false },
      });
      console.log(
        `✅ Deleted ${result.deletedCount} ratings with undefined userId`,
      );
    }

    console.log('🎉 Cleanup completed successfully');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

cleanupNullUserRatings();
