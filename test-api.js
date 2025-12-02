const axios = require('axios');

async function testFinverse() {
  try {
    console.log('Testing Finverse API...\n');
    
    const response = await axios.post('https://api.prod.finverse.net/auth/customer/token', {
      customer_app_id: '01KBCA4DWG5A0E6C7AJMDX43FM',
      client_id: '01KBCA4DT9Y8RWBH73KJRHTAGF',
      client_secret: 'fv-c-1764573431-7a07868e995f13ab6e617c6f3100886858c3b05fc3b50d955e59983d20ad183d',
      grant_type: 'client_credentials'
    });
    
    console.log('✅ SUCCESS! Customer token received!');
    const token = response.data.access_token || response.data.customer_token;
    console.log('Token:', token.substring(0, 40) + '...\n');
    
    console.log('Fetching Indonesian banks...');
    const inst = await axios.get('https://api.prod.finverse.net/institutions', {
      headers: { Authorization: 'Bearer ' + token },
      params: { country: 'ID' }
    });
    
    console.log('Response:', JSON.stringify(inst.data, null, 2).substring(0, 500));
    
    const institutions = inst.data.institutions || inst.data.data || inst.data;
    if (!Array.isArray(institutions)) {
      console.log('❌ Unexpected response format');
      return;
    }
    
    console.log('\n✅ SUCCESS! Found', institutions.length, 'Indonesian banks!\n');
    console.log('First 10 banks:');
    institutions.slice(0,10).forEach((b, i) => {
      console.log('  ' + (i+1) + '.', b.name, '(ID:', b.institution_id || b.id + ')');
    });
    console.log('\n🎉 All working! Your Finverse integration is ready!');
    console.log('✅ Now restart your dev server and try connecting a bank!\n');
    
  } catch (e) {
    console.error('❌ Error:', e.response?.data || e.message);
  }
}

testFinverse();
