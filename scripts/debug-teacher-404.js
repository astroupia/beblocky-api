const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

async function debugTeacher404() {
  const baseUrl = 'https://api.beblocky.com';
  const userId = 'hjlLRzNPCKvAhh4ETHN4OtZ2dlzpMa4h';

  console.log('🔍 Debugging Teacher 404 Issue');
  console.log('================================');

  // Test 1: Direct API call
  console.log('\n1️⃣ Testing API endpoint directly...');
  try {
    const response = await axios.get(`${baseUrl}/teachers/user/${userId}`);
    console.log('✅ API Success - Status:', response.status);
    console.log('   Teacher ID:', response.data._id);
    console.log('   User ID:', response.data.userId);
  } catch (error) {
    console.log('❌ API Error - Status:', error.response?.status);
    console.log('   Message:', error.response?.data);
  }

  // Test 2: Check database directly
  console.log('\n2️⃣ Checking database directly...');
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI not found');
    return;
  }

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const teachersCollection = db.collection('teachers');

    const teacher = await teachersCollection.findOne({ userId });
    if (teacher) {
      console.log('✅ Database Success - Teacher found');
      console.log('   Teacher ID:', teacher._id);
      console.log('   User ID:', teacher.userId);
      console.log('   Organization ID:', teacher.organizationId);
    } else {
      console.log('❌ Database Error - Teacher not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
  }

  // Test 3: Test with different HTTP clients
  console.log('\n3️⃣ Testing with different HTTP clients...');

  // Test with fetch (if available)
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`${baseUrl}/teachers/user/${userId}`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Fetch Success - Status:', response.status);
      console.log('   Teacher ID:', data._id);
    } else {
      console.log('❌ Fetch Error - Status:', response.status);
      console.log('   Message:', data);
    }
  } catch (error) {
    console.log('❌ Fetch not available or failed:', error.message);
  }

  // Test 4: Check if there are any network issues
  console.log('\n4️⃣ Testing basic connectivity...');
  try {
    const response = await axios.get(`${baseUrl}/teachers`);
    console.log('✅ Basic connectivity - Teachers endpoint works');
    console.log('   Total teachers:', response.data.length);
  } catch (error) {
    console.log('❌ Basic connectivity failed:', error.message);
  }

  console.log('\n🎯 Summary:');
  console.log("If API test works but your client doesn't, try:");
  console.log('1. Clear browser cache');
  console.log('2. Use incognito/private mode');
  console.log("3. Check if you're using the correct URL");
  console.log('4. Verify your HTTP client configuration');
  console.log('5. Check for any authentication headers needed');
}

// Run the debug
debugTeacher404();
