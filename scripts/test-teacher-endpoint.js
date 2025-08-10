const axios = require('axios');

async function testTeacherEndpoint() {
  const baseUrl = 'https://api.beblocky.com';
  const userId = 'hjlLRzNPCKvAhh4ETHN4OtZ2dlzpMa4h';

  console.log(`🔍 Testing teacher endpoint for userId: ${userId}`);
  console.log(`URL: ${baseUrl}/teachers/user/${userId}`);

  try {
    const response = await axios.get(`${baseUrl}/teachers/user/${userId}`);
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data);
    console.log('Full error:', error.message);
  }
}

// Run the test
testTeacherEndpoint();
