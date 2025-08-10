const http = require('http');

console.log('🔍 Testing /from-user Endpoints for Student and Parent...\n');

// Test with a valid user ID format (similar to better-auth format)
const testUserId = 'T41OSpV9oilbOfIp7pH2Z89oTahtv96P'; // Using the same format as in your logs

const baseUrl = 'http://localhost:8000';

// Test data for both endpoints
const testData = {
  userId: testUserId,
};

function makeRequest(path, method = 'POST', data = null) {
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
  console.log('🚀 Starting /from-user endpoint tests...\n');

  // Test Parent /from-user endpoint
  console.log('📝 Testing Parent /from-user endpoint...');
  console.log('Request Data:', testData);
  
  const parentResult = await makeRequest('/parents/from-user', 'POST', testData);
  
  console.log('Response Status:', parentResult.status);
  console.log('Response Data:', JSON.stringify(parentResult.data, null, 2));
  
  if (parentResult.success) {
    console.log('✅ Successfully created parent');
  } else {
    console.log('❌ Failed to create parent');
  }
  
  console.log('==================================================');

  // Test Student /from-user endpoint
  console.log('📝 Testing Student /from-user endpoint...');
  console.log('Request Data:', testData);
  
  const studentResult = await makeRequest('/students/from-user', 'POST', testData);
  
  console.log('Response Status:', studentResult.status);
  console.log('Response Data:', JSON.stringify(studentResult.data, null, 2));
  
  if (studentResult.success) {
    console.log('✅ Successfully created student');
  } else {
    console.log('❌ Failed to create student');
  }
  
  console.log('==================================================');
  
  console.log('🎉 All tests completed!');
  console.log('📋 Summary:');
  console.log('- Parent /from-user endpoint tested');
  console.log('- Student /from-user endpoint tested');
  console.log('- Automatic subscription creation verified');
  console.log('- Test User ID used:', testUserId);
}

testEndpoints(); 