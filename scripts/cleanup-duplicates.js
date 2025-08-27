require('dotenv').config();
const mongoose = require('mongoose');

async function cleanupDuplicates() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/beblocky';

  try {
    await mongoose.connect(uri);
    console.log('🔗 Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;
    const studentsCollection = db.collection('students');
    const teachersCollection = db.collection('teachers');
    const parentsCollection = db.collection('parents');

    console.log('\n🧹 Cleaning up duplicate records...\n');

    // Clean up duplicate students
    console.log('🔍 Checking for duplicate students...');
    const duplicateStudents = await studentsCollection
      .aggregate([
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            docs: { $push: '$_id' },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .toArray();

    if (duplicateStudents.length > 0) {
      console.log(
        `Found ${duplicateStudents.length} duplicate student userIds`,
      );

      for (const dup of duplicateStudents) {
        console.log(
          `   Cleaning up userId: ${dup._id} (${dup.count} instances)`,
        );

        // Keep the first document, delete the rest
        const docsToDelete = dup.docs.slice(1);
        for (const docId of docsToDelete) {
          await studentsCollection.deleteOne({ _id: docId });
          console.log(`     Deleted student: ${docId}`);
        }
      }
    } else {
      console.log('✅ No duplicate students found');
    }

    // Clean up duplicate teachers
    console.log('\n🔍 Checking for duplicate teachers...');
    const duplicateTeachers = await teachersCollection
      .aggregate([
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            docs: { $push: '$_id' },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .toArray();

    if (duplicateTeachers.length > 0) {
      console.log(
        `Found ${duplicateTeachers.length} duplicate teacher userIds`,
      );

      for (const dup of duplicateTeachers) {
        console.log(
          `   Cleaning up userId: ${dup._id} (${dup.count} instances)`,
        );

        // Keep the first document, delete the rest
        const docsToDelete = dup.docs.slice(1);
        for (const docId of docsToDelete) {
          await teachersCollection.deleteOne({ _id: docId });
          console.log(`     Deleted teacher: ${docId}`);
        }
      }
    } else {
      console.log('✅ No duplicate teachers found');
    }

    // Clean up duplicate parents
    console.log('\n🔍 Checking for duplicate parents...');
    const duplicateParents = await parentsCollection
      .aggregate([
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            docs: { $push: '$_id' },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ])
      .toArray();

    if (duplicateParents.length > 0) {
      console.log(`Found ${duplicateParents.length} duplicate parent userIds`);

      for (const dup of duplicateParents) {
        console.log(
          `   Cleaning up userId: ${dup._id} (${dup.count} instances)`,
        );

        // Keep the first document, delete the rest
        const docsToDelete = dup.docs.slice(1);
        for (const docId of docsToDelete) {
          await parentsCollection.deleteOne({ _id: docId });
          console.log(`     Deleted parent: ${docId}`);
        }
      }
    } else {
      console.log('✅ No duplicate parents found');
    }

    // Final count check
    console.log('\n📊 Final Collection Counts:');
    const finalStudentCount = await studentsCollection.countDocuments();
    const finalTeacherCount = await teachersCollection.countDocuments();
    const finalParentCount = await parentsCollection.countDocuments();

    console.log(`   Students: ${finalStudentCount}`);
    console.log(`   Teachers: ${finalTeacherCount}`);
    console.log(`   Parents: ${finalParentCount}`);

    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupDuplicates();
