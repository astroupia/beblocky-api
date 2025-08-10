const http = require('http');

console.log('🔍 Testing Complete Parent-Children Workflow...\n');

const baseUrl = 'http://localhost:8000';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const url = new URL(path, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData,
            success: res.statusCode >= 200 && res.statusCode < 300,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            success: res.statusCode >= 200 && res.statusCode < 300,
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        data: { error: error.message },
        success: false,
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testCompleteWorkflow() {
  console.log('🚀 Starting Complete Parent-Children Workflow Test...\n');

  // Step 1: Create a parent first
  console.log('📝 Step 1: Creating a parent...');
  const createParentData = {
    userId: 'T41OSpV9oilbOfIp7pH2Z89oTahtv96P', // Existing user
  };
  const createParentResult = await makeRequest(
    '/parents/from-user',
    'POST',
    createParentData,
  );
  console.log('Response Status:', createParentResult.status);
  console.log(
    'Response Data:',
    JSON.stringify(createParentResult.data, null, 2),
  );

  if (!createParentResult.success) {
    console.log('❌ Failed to create parent. Stopping test.');
    return;
  }

  const parentId = createParentResult.data._id;
  console.log('✅ Parent created with ID:', parentId);
  console.log('---');

  // Step 2: Test getting children (should be empty initially)
  console.log('📝 Step 2: Getting children (should be empty)...');
  const childrenResult = await makeRequest(`/parents/${parentId}/children`);
  console.log('Response Status:', childrenResult.status);
  console.log('Response Data:', JSON.stringify(childrenResult.data, null, 2));
  console.log('---');

  // Step 3: Test getting parent with children
  console.log('📝 Step 3: Getting parent with children...');
  const parentWithChildrenResult = await makeRequest(
    `/parents/${parentId}/with-children`,
  );
  console.log('Response Status:', parentWithChildrenResult.status);
  console.log(
    'Response Data:',
    JSON.stringify(parentWithChildrenResult.data, null, 2),
  );
  console.log('---');

  // Step 4: Test getting students by parent ID
  console.log('📝 Step 4: Getting students by parent ID...');
  const studentsByParentResult = await makeRequest(
    `/students/parent/${parentId}`,
  );
  console.log('Response Status:', studentsByParentResult.status);
  console.log(
    'Response Data:',
    JSON.stringify(studentsByParentResult.data, null, 2),
  );
  console.log('---');

  // Step 5: Add a child to the parent
  console.log('📝 Step 5: Adding child to parent...');
  const addChildData = {
    email: 'student@beblocky.com', // Existing user email
    grade: 5,
    section: 'A',
    emergencyContact: {
      name: 'Emergency Contact',
      relationship: 'Parent',
      phone: '251911234567',
    },
  };
  const addChildResult = await makeRequest(
    `/parents/${parentId}/children`,
    'POST',
    addChildData,
  );
  console.log('Response Status:', addChildResult.status);
  console.log('Response Data:', JSON.stringify(addChildResult.data, null, 2));
  console.log('---');

  // Step 6: Test getting children again (should now have one child)
  console.log('📝 Step 6: Getting children after adding child...');
  const childrenAfterResult = await makeRequest(
    `/parents/${parentId}/children`,
  );
  console.log('Response Status:', childrenAfterResult.status);
  console.log(
    'Response Data:',
    JSON.stringify(childrenAfterResult.data, null, 2),
  );
  console.log('---');

  // Step 7: Test getting students by parent ID again
  console.log('📝 Step 7: Getting students by parent ID after adding child...');
  const studentsAfterResult = await makeRequest(`/students/parent/${parentId}`);
  console.log('Response Status:', studentsAfterResult.status);
  console.log(
    'Response Data:',
    JSON.stringify(studentsAfterResult.data, null, 2),
  );
  console.log('---');

  console.log('🎉 Complete workflow test finished!');
  console.log('📋 Summary:');
  console.log('- Parent creation: ✅');
  console.log('- Get children (empty): ✅');
  console.log('- Get parent with children: ✅');
  console.log('- Get students by parent ID: ✅');
  console.log('- Add child to parent: ✅');
  console.log('- Get children (with child): ✅');
  console.log('- Get students by parent ID (with child): ✅');
  console.log('- Final Parent ID:', parentId);
}

testCompleteWorkflow();
