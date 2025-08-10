const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Environment Variable Issue...\n');

const envPath = path.join(__dirname, '..', '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file in the root directory.');
  process.exit(1);
}

// Read current .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Check if API_KEY already exists
if (envContent.includes('API_KEY=')) {
  console.log('✅ API_KEY already exists in .env file');
  process.exit(0);
}

// Check if ARIFPAY_API_KEY exists
if (envContent.includes('ARIFPAY_API_KEY=')) {
  // Extract the ARIFPAY_API_KEY value
  const match = envContent.match(/ARIFPAY_API_KEY=(.+)/);
  if (match) {
    const apiKeyValue = match[1].trim();

    // Add API_KEY line
    const newLine = `API_KEY=${apiKeyValue}\n`;
    envContent += newLine;

    // Write back to .env file
    fs.writeFileSync(envPath, envContent);

    console.log('✅ Successfully added API_KEY to .env file');
    console.log(`🔑 API_KEY=${apiKeyValue.substring(0, 10)}...`);
    console.log('\n🎉 Environment variable issue fixed!');
    console.log('💡 Restart your server for the changes to take effect.');
  } else {
    console.log('❌ Could not extract ARIFPAY_API_KEY value');
  }
} else {
  console.log('❌ ARIFPAY_API_KEY not found in .env file');
  console.log('Please add your ArifPay API key to the .env file:');
  console.log('API_KEY=your_arifpay_api_key_here');
}
