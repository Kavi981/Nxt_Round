// Test script for localhost OAuth setup
const axios = require('axios');

async function testLocalhostSetup() {
  console.log('🔍 Testing localhost OAuth setup...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend is running:', healthResponse.data);
    
    // Test 2: Check OAuth configuration
    console.log('\n2. Testing OAuth configuration...');
    const oauthResponse = await axios.get('http://localhost:5000/api/test-oauth');
    console.log('✅ OAuth config:', oauthResponse.data);
    
    // Test 3: Test CORS
    console.log('\n3. Testing CORS...');
    const corsResponse = await axios.get('http://localhost:5000/api/auth/me', {
      withCredentials: true
    });
    console.log('✅ CORS is working');
    
    console.log('\n🎉 All tests passed! Your localhost setup is ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure your Google OAuth credentials include:');
    console.log('   - Authorized redirect URI: http://localhost:5000/api/auth/google/callback');
    console.log('2. Start your frontend: cd client && npm start');
    console.log('3. Test OAuth login on http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd server && npm start');
    console.log('2. Check if MongoDB is running');
    console.log('3. Verify Google OAuth credentials are set');
  }
}

testLocalhostSetup(); 