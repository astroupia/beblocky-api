const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testProgressCourseIntegration() {
  console.log('🧪 Testing Progress-Course Integration\n');

  try {
    // Step 1: Create a teacher user
    console.log('1️⃣ Creating teacher user...');
    const teacherUserResponse = await axios.post(`${BASE_URL}/users`, {
      _id: 'test-teacher-123',
      email: 'teacher@test.com',
      name: 'Test Teacher',
      role: 'teacher',
    });

    const teacherUser = teacherUserResponse.data;
    console.log(`✅ Teacher user created: ${teacherUser._id}`);

    // Step 2: Create teacher instance
    console.log('\n2️⃣ Creating teacher instance...');
    const teacherResponse = await axios.post(`${BASE_URL}/teachers/from-user`, {
      userId: teacherUser._id,
      specialization: 'Programming',
      experience: 5,
    });

    const teacher = teacherResponse.data;
    console.log(`✅ Teacher created: ${teacher._id}`);

    // Step 3: Create a course
    console.log('\n3️⃣ Creating course...');
    const courseResponse = await axios.post(`${BASE_URL}/courses`, {
      courseTitle: 'Test Course for Progress',
      courseDescription: 'A test course to verify progress-course integration',
      courseLanguage: 'English',
      creatorId: teacher._id,
      subType: 'Free',
      status: 'Active',
    });

    const course = courseResponse.data;
    console.log(`✅ Course created: ${course._id}`);
    console.log(
      `📋 Course students array: ${course.students?.length || 0} students`,
    );

    // Step 4: Create a student user
    console.log('\n4️⃣ Creating student user...');
    const studentUserResponse = await axios.post(`${BASE_URL}/users`, {
      _id: 'test-student-456',
      email: 'student@test.com',
      name: 'Test Student',
      role: 'student',
    });

    const studentUser = studentUserResponse.data;
    console.log(`✅ Student user created: ${studentUser._id}`);

    // Step 5: Create student instance
    console.log('\n5️⃣ Creating student instance...');
    const studentResponse = await axios.post(`${BASE_URL}/students/from-user`, {
      userId: studentUser._id,
      grade: 5,
      gender: 'male',
    });

    const student = studentResponse.data;
    console.log(`✅ Student created: ${student._id}`);

    // Step 6: Create progress (this should add student to course)
    console.log('\n6️⃣ Creating progress (should add student to course)...');
    const progressResponse = await axios.post(`${BASE_URL}/progress`, {
      studentId: student._id,
      courseId: course._id,
    });

    const progress = progressResponse.data;
    console.log(`✅ Progress created: ${progress._id}`);

    // Step 7: Verify student was added to course
    console.log('\n7️⃣ Verifying student was added to course...');
    const updatedCourseResponse = await axios.get(
      `${BASE_URL}/courses/${course._id}`,
    );
    const updatedCourse = updatedCourseResponse.data;

    console.log(
      `📋 Updated course students array: ${updatedCourse.students?.length || 0} students`,
    );

    if (updatedCourse.students && updatedCourse.students.length > 0) {
      const studentInCourse = updatedCourse.students.find(
        (s) => s._id === student._id,
      );
      if (studentInCourse) {
        console.log(
          '🎉 SUCCESS: Student was automatically added to course students array!',
        );
      } else {
        console.log(
          '❌ FAILED: Student was not found in course students array',
        );
      }
    } else {
      console.log('❌ FAILED: Course students array is empty');
    }

    // Step 8: Test duplicate progress creation (should not add student again)
    console.log('\n8️⃣ Testing duplicate progress creation...');
    try {
      await axios.post(`${BASE_URL}/progress`, {
        studentId: student._id,
        courseId: course._id,
      });
      console.log(
        '❌ FAILED: Duplicate progress was created (should have failed)',
      );
    } catch (error) {
      if (
        error.response?.status === 500 &&
        error.response?.data?.message?.includes('already exists')
      ) {
        console.log(
          '✅ SUCCESS: Duplicate progress creation correctly prevented',
        );
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Step 9: Create another student and progress to test multiple students
    console.log('\n9️⃣ Testing with second student...');
    const student2UserResponse = await axios.post(`${BASE_URL}/users`, {
      _id: 'test-student-789',
      email: 'student2@test.com',
      name: 'Test Student 2',
      role: 'student',
    });

    const student2User = student2UserResponse.data;
    const student2Response = await axios.post(
      `${BASE_URL}/students/from-user`,
      {
        userId: student2User._id,
        grade: 6,
        gender: 'female',
      },
    );

    const student2 = student2Response.data;
    console.log(`✅ Second student created: ${student2._id}`);

    const progress2Response = await axios.post(`${BASE_URL}/progress`, {
      studentId: student2._id,
      courseId: course._id,
    });

    const progress2 = progress2Response.data;
    console.log(`✅ Second progress created: ${progress2._id}`);

    // Step 10: Verify both students are in course
    console.log('\n🔟 Verifying both students in course...');
    const finalCourseResponse = await axios.get(
      `${BASE_URL}/courses/${course._id}`,
    );
    const finalCourse = finalCourseResponse.data;

    console.log(
      `📋 Final course students array: ${finalCourse.students?.length || 0} students`,
    );

    if (finalCourse.students && finalCourse.students.length === 2) {
      const student1InCourse = finalCourse.students.find(
        (s) => s._id === student._id,
      );
      const student2InCourse = finalCourse.students.find(
        (s) => s._id === student2._id,
      );

      if (student1InCourse && student2InCourse) {
        console.log(
          '🎉 SUCCESS: Both students are in the course students array!',
        );
      } else {
        console.log(
          '❌ FAILED: Not all students found in course students array',
        );
      }
    } else {
      console.log(
        `❌ FAILED: Expected 2 students, found ${finalCourse.students?.length || 0}`,
      );
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testProgressCourseIntegration();
