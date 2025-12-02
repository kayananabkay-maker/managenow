// Test Finverse API Connection
const axios = require('axios');
const fs = require('fs');

// Load credentials from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const FINVERSE_CUSTOMER_APP_ID = envContent.match(/FINVERSE_CUSTOMER_APP_ID=(.*)/)[1].trim();
const FINVERSE_CLIENT_ID = envContent.match(/FINVERSE_CLIENT_ID=(.*)/)[1].trim();
const FINVERSE_CLIENT_SECRET = envContent.match(/FINVERSE_CLIENT_SECRET=(.*)/)[1].trim();
const FINVERSE_BASE_URL = 'https://api.prod.finverse.net';

console.log('🧪 Testing Finverse API Connection...\n');
console.log('Base URL:', FINVERSE_BASE_URL);
console.log('Customer App ID:', FINVERSE_CUSTOMER_APP_ID);
console.log('Client Secret length:', FINVERSE_CLIENT_SECRET.length, 'characters\n');

async function testFinverseAPI() {
  try {
    // Step 1: Get customer token
    console.log('📡 Step 1: Getting customer token...');
    const tokenResponse = await axios.post(`${FINVERSE_BASE_URL}/auth/customer/token`, {
      customer_app_id: FINVERSE_CUSTOMER_APP_ID,
      client_id: FINVERSE_CLIENT_ID,
      client_secret: FINVERSE_CLIENT_SECRET,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const customerToken = tokenResponse.data.customer_token;
    console.log('✅ Customer token received:', customerToken.substring(0, 30) + '...\n');
    
    // Step 2: Get institutions
    console.log('📡 Step 2: Fetching Indonesian banks...');
    const instResponse = await axios.get(`${FINVERSE_BASE_URL}/institutions`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`,
      },
      params: {
        country: 'ID',
      },
    });

    const institutions = instResponse.data.institutions || instResponse.data;
    console.log(`✅ SUCCESS! Found ${institutions.length} Indonesian banks!\n`);
    
    console.log('🏦 First 10 banks:');
    institutions.slice(0, 10).forEach((bank, idx) => {
      console.log(`  ${idx + 1}. ${bank.name} (ID: ${bank.institution_id})`);
    });
    
    console.log('\n🎉 All tests passed! Your Finverse API is working!\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
    if (error.response) {
      console.error('\nHTTP Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testFinverseAPI();
