import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🧪 Testing login with updated credentials...\n');

    const response = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'john_doe',
        password: 'password'
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('📄 Response:', JSON.stringify(result, null, 2));
      
      // Test the token with a protected endpoint
      console.log('\n🔐 Testing protected endpoint...');
      const balanceResponse = await fetch('http://localhost:8080/api/v1/account/balance', {
        headers: {
          'Authorization': `Bearer ${(result as any).token}`
        }
      });

      const balanceResult = await balanceResponse.json();
      
      if (balanceResponse.ok) {
        console.log('✅ Protected endpoint works!');
        console.log('💰 Balance:', JSON.stringify(balanceResult, null, 2));
      } else {
        console.log('❌ Protected endpoint failed:', balanceResult);
      }

    } else {
      console.log('❌ Login failed!');
      console.log('📄 Response:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.log('💥 Error during test:', error);
  }
}

testLogin();
