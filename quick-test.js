#!/usr/bin/env node

/**
 * Quick PackChain Test Script
 * Basic functionality validation
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

async function quickTest() {
  console.log('🧪 Quick PackChain Test\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', health.data.status);

    // 2. Register test user
    console.log('\n2️⃣ Testing user registration...');
    const userData = {
      username: 'quicktest',
      email: 'quick@test.com',
      password: 'TestPass123',
      firstName: 'Quick',
      lastName: 'Test'
    };
    
    const register = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log('✅ User registered:', register.data.user.username);

    // 3. Login
    console.log('\n3️⃣ Testing user login...');
    const login = await axios.post(`${API_BASE}/auth/login`, {
      email: 'quick@test.com',
      password: 'TestPass123'
    });
    const token = login.data.token;
    console.log('✅ Login successful, token received');

    // 4. Create package
    console.log('\n4️⃣ Testing package creation...');
    const packageData = {
      packageId: 'PKG_QUICK_001',
      rfidTag: 'RFID_QUICK_001',
      type: 'cardboard',
      material: 'Recycled cardboard'
    };
    
    const packageResponse = await axios.post(`${API_BASE}/packages`, packageData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Package created:', packageResponse.data.package.packageId);

    // 5. Test blockchain status
    console.log('\n5️⃣ Testing blockchain status...');
    const blockchain = await axios.get(`${API_BASE}/blockchain/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Blockchain status:', blockchain.data.status);

    // 6. Test analytics
    console.log('\n6️⃣ Testing analytics...');
    const analytics = await axios.get(`${API_BASE}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Analytics working, total packages:', analytics.data.totalPackages);

    console.log('\n🎉 All tests passed! PackChain is working correctly.');
    console.log('💡 Access the frontend at: http://localhost:8080');
    console.log('🔗 API health check: http://localhost:3001/health');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd server && npm start');
  }
}

quickTest(); 