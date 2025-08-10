const http = require('http');

console.log('🔍 Testing Parent-Children Endpoints...\n');

// Test data
const testParentId = '688faaa368c18aaca3a1861d'; // From our previous test
const testEmail = 'student@beblocky.com'; // Existing user email

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

async function testEndpoints() {
  console.log('🚀 Starting Parent-Children endpoint tests...\n');

  // Test 1: Get children of a parent
  console.log('📝 Test 1: Getting children of a parent...');
  const childrenResult = await makeRequest(`/parents/${testParentId}/children`);
  console.log('Response Status:', childrenResult.status);
  console.log('Response Data:', JSON.stringify(childrenResult.data, null, 2));
  console.log('---');

  // Test 2: Get parent with populated children
  console.log('📝 Test 2: Getting parent with populated children...');
  const parentWithChildrenResult = await makeRequest(
    `/parents/${testParentId}/with-children`,
  );
  console.log('Response Status:', parentWithChildrenResult.status);
  console.log(
    'Response Data:',
    JSON.stringify(parentWithChildrenResult.data, null, 2),
  );
  console.log('---');

  // Test 3: Get students by parent ID
  console.log('📝 Test 3: Getting students by parent ID...');
  const studentsByParentResult = await makeRequest(
    `/students/parent/${testParentId}`,
  );
  console.log('Response Status:', studentsByParentResult.status);
  console.log(
    'Response Data:',
    JSON.stringify(studentsByParentResult.data, null, 2),
  );
  console.log('---');

  // Test 4: Add child to parent
  console.log('📝 Test 4: Adding child to parent...');
  const addChildData = {
    email: testEmail,
    grade: 5,
    section: 'A',
    emergencyContact: {
      name: 'Emergency Contact',
      relationship: 'Parent',
      phone: '251911234567',
    },
  };
  const addChildResult = await makeRequest(
    `/parents/${testParentId}/children`,
    'POST',
    addChildData,
  );
  console.log('Response Status:', addChildResult.status);
  console.log('Response Data:', JSON.stringify(addChildResult.data, null, 2));
  console.log('---');

  console.log('🎉 All tests completed!');
  console.log('📋 Summary:');
  console.log('- Get children endpoint tested');
  console.log('- Get parent with children endpoint tested');
  console.log('- Get students by parent ID endpoint tested');
  console.log('- Add child to parent endpoint tested');
  console.log('- Test Parent ID used:', testParentId);
  console.log('- Test Email used:', testEmail);
}

testEndpoints();
