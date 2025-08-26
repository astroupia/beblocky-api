const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:8000';

async function testCloudinaryUpload() {
  console.log('☁️ Testing Cloudinary Upload\n');

  try {
    // Test 1: Upload a sample image (if available)
    console.log('1️⃣ Testing image upload...');

    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0x00, 0x00,
      0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb0, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const formData = new FormData();
    formData.append('file', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png',
    });

    try {
      const response = await axios.post(`${BASE_URL}/uploadMedia`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      console.log('✅ Image upload successful!');
      console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log(
        '❌ Image upload failed:',
        error.response?.data || error.message,
      );
    }

    // Test 2: Try to upload without file
    console.log('\n2️⃣ Testing upload without file...');

    try {
      const emptyFormData = new FormData();
      const response = await axios.post(
        `${BASE_URL}/uploadMedia`,
        emptyFormData,
        {
          headers: {
            ...emptyFormData.getHeaders(),
          },
        },
      );
      console.log('❌ Should have failed but succeeded:', response.data);
    } catch (error) {
      console.log('✅ Correctly rejected empty upload');
      console.log('📥 Error:', error.response?.data || error.message);
    }

    // Test 3: Upload with invalid content type
    console.log('\n3️⃣ Testing upload with invalid content...');

    const invalidFormData = new FormData();
    invalidFormData.append('file', 'not-a-file', {
      filename: 'test.txt',
      contentType: 'text/plain',
    });

    try {
      const response = await axios.post(
        `${BASE_URL}/uploadMedia`,
        invalidFormData,
        {
          headers: {
            ...invalidFormData.getHeaders(),
          },
        },
      );
      console.log('❌ Should have failed but succeeded:', response.data);
    } catch (error) {
      console.log('✅ Correctly rejected invalid content');
      console.log('📥 Error:', error.response?.data || error.message);
    }

    console.log('\n🎉 Cloudinary upload tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for manual testing
console.log('📋 Manual Testing Instructions:\n');

console.log('1️⃣ Using cURL:');
console.log('curl -X POST http://localhost:8000/uploadMedia \\');
console.log('  -F "file=@/path/to/your/image.jpg"\n');

console.log('2️⃣ Using Postman/Insomnia:');
console.log('- Method: POST');
console.log('- URL: http://localhost:8000/uploadMedia');
console.log('- Body: form-data');
console.log('- Key: file (Type: File)');
console.log('- Value: Select your image file\n');

console.log('3️⃣ Using JavaScript:');
console.log(`
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8000/uploadMedia', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Uploaded URL:', result.url);
`);

console.log('4️⃣ Expected Response:');
console.log(`
{
  "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/filename.jpg"
}
`);

// Run the tests
testCloudinaryUpload();
