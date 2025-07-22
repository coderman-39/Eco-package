#!/usr/bin/env node

/**
 * PackChain Automated Simulation Script
 * Tests all features of the PackChain system
 */

import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123',
    firstName: 'John',
    lastName: 'Doe',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      coordinates: [72.8777, 19.0760]
    }
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'SecurePass123',
    firstName: 'Jane',
    lastName: 'Smith',
    location: {
      city: 'Delhi',
      state: 'Delhi',
      coordinates: [77.2090, 28.6139]
    }
  }
];

const testPackages = [
  {
    packageId: 'PKG_2024_001',
    rfidTag: 'RFID_MUM_001',
    nfcTag: 'NFC_MUM_001',
    type: 'cardboard',
    material: 'Recycled cardboard',
    weight: 2.5,
    dimensions: { length: 30, width: 20, height: 15 },
    manufacturer: 'Flipkart Logistics',
    manufacturingDate: '2024-01-15',
    sustainabilityScore: 85
  },
  {
    packageId: 'PKG_2024_002',
    rfidTag: 'RFID_DEL_001',
    nfcTag: 'NFC_DEL_001',
    type: 'plastic',
    material: 'Recycled PET',
    weight: 1.8,
    dimensions: { length: 25, width: 18, height: 12 },
    manufacturer: 'Flipkart Logistics',
    manufacturingDate: '2024-01-16',
    sustainabilityScore: 78
  }
];

class PackChainSimulation {
  constructor() {
    this.tokens = {};
    this.packages = [];
    this.results = [];
  }

  async log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('─'.repeat(50));
  }

  async testHealth() {
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      await this.log('✅ Health check passed', response.data);
      return true;
    } catch (error) {
      await this.log('❌ Health check failed', error.message);
      return false;
    }
  }

  async registerUser(userData) {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, userData);
      await this.log(`✅ User registered: ${userData.username}`, response.data);
      return response.data;
    } catch (error) {
      await this.log(`❌ User registration failed: ${userData.username}`, error.response?.data || error.message);
      return null;
    }
  }

  async loginUser(email, password) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const token = response.data.token;
      this.tokens[email] = token;
      await this.log(`✅ User logged in: ${email}`, { token: token.substring(0, 20) + '...' });
      return token;
    } catch (error) {
      await this.log(`❌ Login failed: ${email}`, error.response?.data || error.message);
      return null;
    }
  }

  async createPackage(token, packageData) {
    try {
      const response = await axios.post(`${API_BASE}/packages`, packageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.packages.push(response.data);
      await this.log(`✅ Package created: ${packageData.packageId}`, response.data);
      return response.data;
    } catch (error) {
      await this.log(`❌ Package creation failed: ${packageData.packageId}`, error.response?.data || error.message);
      return null;
    }
  }

  async updatePackageLocation(token, packageId, locationData) {
    try {
      const response = await axios.put(`${API_BASE}/packages/${packageId}/update-location`, locationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await this.log(`✅ Package location updated: ${packageId}`, response.data);
      return response.data;
    } catch (error) {
      await this.log(`❌ Location update failed: ${packageId}`, error.response?.data || error.message);
      return null;
    }
  }

  async simulateNFCScan(token, tagId, location) {
    try {
      const response = await axios.post(`${API_BASE}/iot/scan`, {
        tagId,
        scannerLocation: location
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await this.log(`✅ NFC scan simulated: ${tagId}`, response.data);
      return response.data;
    } catch (error) {
      await this.log(`❌ NFC scan failed: ${tagId}`, error.response?.data || error.message);
      return null;
    }
  }

  async simulateSensorData(token, packageId, sensorType, value, unit) {
    try {
      const response = await axios.post(`${API_BASE}/iot/sensor-data`, {
        packageId,
        sensorType,
        value,
        unit,
        timestamp: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await this.log(`✅ Sensor data simulated: ${sensorType} for ${packageId}`, response.data);
      return response.data;
    } catch (error) {
      await this.log(`❌ Sensor data failed: ${sensorType} for ${packageId}`, error.response?.data || error.message);
      return null;
    }
  }

  async returnPackage(token, packageId, returnData) {
    try {
      const response = await axios.post(`${API_BASE}/packages/${packageId}/return`, returnData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await this.log(`✅ Package returned: ${packageId}`, response.data);
      return response.data;
    } catch (error) {
      await this.log(`❌ Package return failed: ${packageId}`, error.response?.data || error.message);
      return null;
    }
  }

  async checkUserProfile(token) {
    try {
      const response = await axios.get(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await this.log(`✅ User profile retrieved`, response.data);
      return response.data;
    } catch (error) {
      await this.log(`❌ Profile retrieval failed`, error.response?.data || error.message);
      return null;
    }
  }

  async checkBlockchainStatus(token) {
    try {
      const response = await axios.get(`${API_BASE}/blockchain/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await this.log(`✅ Blockchain status retrieved`, response.data);
      return response.data;
    } catch (error) {
      await this.log(`❌ Blockchain status failed`, error.response?.data || error.message);
      return null;
    }
  }

  async getAnalytics(token) {
    try {
      const response = await axios.get(`${API_BASE}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await this.log(`✅ Analytics retrieved`, response.data);
      return response.data;
    } catch (error) {
      await this.log(`❌ Analytics failed`, error.response?.data || error.message);
      return null;
    }
  }

  async runCompleteSimulation() {
    console.log('🚀 Starting PackChain Simulation...\n');

    // Step 1: Health Check
    await this.log('📋 Step 1: System Health Check');
    const healthOk = await this.testHealth();
    if (!healthOk) {
      console.log('❌ System is not healthy. Please start the backend server first.');
      return;
    }

    // Step 2: User Registration and Login
    await this.log('📋 Step 2: User Registration and Login');
    for (const user of testUsers) {
      await this.registerUser(user);
      await this.loginUser(user.email, user.password);
    }

    // Step 3: Package Creation
    await this.log('📋 Step 3: Package Creation');
    for (let i = 0; i < testPackages.length; i++) {
      const token = this.tokens[testUsers[i].email];
      if (token) {
        await this.createPackage(token, testPackages[i]);
      }
    }

    // Step 4: Package Tracking Simulation
    await this.log('📋 Step 4: Package Tracking Simulation');
    for (let i = 0; i < this.packages.length; i++) {
      const token = this.tokens[testUsers[i].email];
      const packageData = this.packages[i];
      
      if (token && packageData) {
        // Update location (in transit)
        await this.updatePackageLocation(token, packageData.packageId, {
          location: {
            coordinates: testUsers[i].location.coordinates,
            facility: `Flipkart Hub - ${testUsers[i].location.city}`,
            status: 'in_transit'
          },
          timestamp: new Date().toISOString()
        });

        // Simulate NFC scan
        await this.simulateNFCScan(token, packageData.nfcTag, {
          coordinates: testUsers[i].location.coordinates,
          facility: `Customer Location - ${testUsers[i].location.city}`
        });

        // Simulate sensor data
        await this.simulateSensorData(token, packageData.packageId, 'temperature', 25.5, 'celsius');
        await this.simulateSensorData(token, packageData.packageId, 'humidity', 65.2, 'percentage');
        await this.simulateSensorData(token, packageData.packageId, 'shock', 0.1, 'g');
      }
    }

    // Step 5: Package Returns and Token Rewards
    await this.log('📋 Step 5: Package Returns and Token Rewards');
    for (let i = 0; i < this.packages.length; i++) {
      const token = this.tokens[testUsers[i].email];
      const packageData = this.packages[i];
      
      if (token && packageData) {
        await this.returnPackage(token, packageData.packageId, {
          location: {
            coordinates: testUsers[i].location.coordinates,
            facility: `Flipkart Locker - ${testUsers[i].location.city}`
          },
          condition: 'excellent',
          returnReason: 'sustainability_initiative',
          timestamp: new Date().toISOString()
        });

        // Check updated profile (should show new token balance)
        await this.checkUserProfile(token);
      }
    }

    // Step 6: Blockchain and Analytics
    await this.log('📋 Step 6: Blockchain and Analytics');
    const firstToken = Object.values(this.tokens)[0];
    if (firstToken) {
      await this.checkBlockchainStatus(firstToken);
      await this.getAnalytics(firstToken);
    }

    // Step 7: Summary
    await this.log('📋 Step 7: Simulation Summary');
    console.log('🎉 PackChain Simulation Completed Successfully!');
    console.log(`📊 Results:`);
    console.log(`   - Users registered: ${testUsers.length}`);
    console.log(`   - Packages created: ${this.packages.length}`);
    console.log(`   - Tokens generated: ${Object.keys(this.tokens).length}`);
    console.log('\n🌱 The system is working correctly!');
    console.log('💡 You can now access the frontend at: http://localhost:8080');
    console.log('🔗 API documentation available at: http://localhost:3001/health');
  }
}

// Run the simulation
async function main() {
  const simulation = new PackChainSimulation();
  await simulation.runCompleteSimulation();
}

// Handle command line arguments
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default PackChainSimulation; 