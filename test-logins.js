const fetch = require('node-fetch');

const baseURL = 'http://localhost:3000';

async function testLogin(endpoint, email, password, userType) {
  try {
    console.log(`\n🧪 Testing ${userType} Login...`);
    console.log(`   Email: ${email}`);
    console.log(`   Endpoint: ${endpoint}`);
    
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ ${userType} Login: SUCCESS`);
      console.log(`   Token: ${result.token ? 'Generated' : 'None'}`);
      console.log(`   User: ${result.user ? result.user.name : 'None'}`);
    } else {
      console.log(`   ❌ ${userType} Login: FAILED`);
      console.log(`   Error: ${result.message || 'Unknown error'}`);
    }
    
    return response.ok;
  } catch (error) {
    console.log(`   ❌ ${userType} Login: ERROR`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAllLogins() {
  console.log('🚀 Testing All Login Systems');
  console.log('=' .repeat(50));
  
  const results = await Promise.all([
    testLogin('/api/auth/student-login', 'vipinsamy@gmail.com', '123456', 'Student'),
    testLogin('/api/admin/login', 'testadmin@example.com', 'admin123', 'Admin'),
    testLogin('/api/auth/faculty-login', 'testfaculty@example.com', 'faculty123', 'Faculty')
  ]);
  
  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(50));
  console.log(`Student Login: ${results[0] ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Admin Login:   ${results[1] ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Faculty Login: ${results[2] ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = results.every(r => r);
  console.log(`\nOverall: ${allPassed ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);
}

testAllLogins();




