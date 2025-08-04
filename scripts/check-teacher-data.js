const mongoose = require('mongoose');

async function checkTeacherData() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beblocky';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const teachersCollection = db.collection('teachers');

    // Check all teachers
    console.log('📋 Checking all teachers in the collection:');
    const teachers = await teachersCollection.find({}).toArray();
    console.log(`Total teachers: ${teachers.length}`);

    if (teachers.length > 0) {
      console.log('\n📋 Sample teacher documents:');
      teachers.slice(0, 3).forEach((teacher, index) => {
        console.log(`\nTeacher ${index + 1}:`);
        console.log(JSON.stringify(teacher, null, 2));
      });
    }

    // Check for teachers with email field
    const teachersWithEmail = await teachersCollection
      .find({ email: { $exists: true } })
      .toArray();
    console.log(`\n📋 Teachers with email field: ${teachersWithEmail.length}`);

    if (teachersWithEmail.length > 0) {
      console.log('Teachers with email field:');
      teachersWithEmail.forEach((teacher) => {
        console.log(
          `  - _id: ${teacher._id}, email: ${teacher.email}, userId: ${teacher.userId}`,
        );
      });
    }

    // Check for teachers with null email
    const teachersWithNullEmail = await teachersCollection
      .find({ email: null })
      .toArray();
    console.log(
      `\n📋 Teachers with null email: ${teachersWithNullEmail.length}`,
    );

    if (teachersWithNullEmail.length > 0) {
      console.log('Teachers with null email:');
      teachersWithNullEmail.forEach((teacher) => {
        console.log(`  - _id: ${teacher._id}, userId: ${teacher.userId}`);
      });
    }

    // Check indexes again
    console.log('\n📋 Current indexes:');
    const indexes = await teachersCollection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the check
checkTeacherData();
