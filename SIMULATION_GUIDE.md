# 🧪 PackChain Simulation Guide

This guide will help you run comprehensive simulations to test the PackChain system in real-world scenarios.

## 📋 Prerequisites

Before running the simulation, ensure you have:

1. **Node.js 18+** and **npm** installed
2. **MongoDB** running locally or cloud instance
3. **Backend server** running on port 3001
4. **Frontend** running on port 8080 (optional for UI testing)

## 🚀 Quick Start Simulation

### Step 1: Start the Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

You should see:
```
🚀 PackChain Backend Server running on port 3001
📊 MongoDB connected successfully
🔗 WebSocket server initialized
```

### Step 2: Run the Automated Simulation

```bash
# From the root directory
node simulation.js
```

This will run a complete end-to-end simulation including:
- ✅ System health check
- ✅ User registration and authentication
- ✅ Package creation and tracking
- ✅ NFC/RFID scanning simulation
- ✅ IoT sensor data simulation
- ✅ Package returns and token rewards
- ✅ Blockchain status verification
- ✅ Analytics dashboard testing

## 🎯 Manual Testing Scenarios

### Scenario 1: User Registration and Login

```bash
# Test user registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123",
    "firstName": "Test",
    "lastName": "User",
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "coordinates": [72.8777, 19.0760]
    }
  }'

# Test user login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Scenario 2: Package Lifecycle Simulation

```bash
# 1. Create a package
curl -X POST http://localhost:3001/api/packages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "PKG_TEST_001",
    "rfidTag": "RFID_TEST_001",
    "nfcTag": "NFC_TEST_001",
    "type": "cardboard",
    "material": "Recycled cardboard",
    "weight": 2.5,
    "dimensions": {"length": 30, "width": 20, "height": 15},
    "manufacturer": "Flipkart Logistics",
    "manufacturingDate": "2024-01-15",
    "sustainabilityScore": 85
  }'

# 2. Update package location (in transit)
curl -X PUT http://localhost:3001/api/packages/PKG_TEST_001/update-location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "coordinates": [72.8777, 19.0760],
      "facility": "Flipkart Hub - Mumbai",
      "status": "in_transit"
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }'

# 3. Simulate NFC scan
curl -X POST http://localhost:3001/api/iot/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tagId": "NFC_TEST_001",
    "scannerLocation": {
      "coordinates": [72.8777, 19.0760],
      "facility": "Customer Location - Mumbai"
    }
  }'

# 4. Return package and earn tokens
curl -X POST http://localhost:3001/api/packages/PKG_TEST_001/return \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "coordinates": [72.8777, 19.0760],
      "facility": "Flipkart Locker - Mumbai"
    },
    "condition": "excellent",
    "returnReason": "sustainability_initiative",
    "timestamp": "2024-01-15T16:00:00Z"
  }'
```

### Scenario 3: IoT Sensor Data Simulation

```bash
# Simulate temperature sensor
curl -X POST http://localhost:3001/api/iot/sensor-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "PKG_TEST_001",
    "sensorType": "temperature",
    "value": 25.5,
    "unit": "celsius",
    "timestamp": "2024-01-15T12:00:00Z"
  }'

# Simulate humidity sensor
curl -X POST http://localhost:3001/api/iot/sensor-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "PKG_TEST_001",
    "sensorType": "humidity",
    "value": 65.2,
    "unit": "percentage",
    "timestamp": "2024-01-15T12:00:00Z"
  }'

# Simulate shock sensor
curl -X POST http://localhost:3001/api/iot/sensor-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "PKG_TEST_001",
    "sensorType": "shock",
    "value": 0.1,
    "unit": "g",
    "timestamp": "2024-01-15T12:00:00Z"
  }'
```

### Scenario 4: Blockchain and Analytics Testing

```bash
# Check blockchain network status
curl -X GET http://localhost:3001/api/blockchain/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get network nodes
curl -X GET http://localhost:3001/api/blockchain/nodes \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get analytics dashboard
curl -X GET http://localhost:3001/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get environmental metrics
curl -X GET http://localhost:3001/api/analytics/environmental \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 Real-time Testing

### WebSocket Connection Test

Open your browser console and run:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3001');

// Listen for real-time updates
socket.on('connect', () => {
  console.log('✅ Connected to PackChain WebSocket');
});

socket.on('package_update', (data) => {
  console.log('📦 Package update received:', data);
});

socket.on('token_reward', (data) => {
  console.log('🏆 Token reward received:', data);
});

socket.on('iot_alert', (data) => {
  console.log('⚠️ IoT alert received:', data);
});
```

### Frontend Integration Test

1. Start the frontend:
```bash
npm run dev
```

2. Open http://localhost:8080 in your browser

3. Test the following features:
   - User registration and login
   - Package tracking dashboard
   - Token wallet and rewards
   - Leaderboard
   - Blockchain network status
   - Real-time updates

## 📊 Expected Simulation Results

### Successful Simulation Output

```
🚀 Starting PackChain Simulation...

[2024-01-15T10:00:00.000Z] 📋 Step 1: System Health Check
✅ Health check passed
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "blockchain": "simulated",
    "iot": "simulated"
  }
}
──────────────────────────────────────────────────

[2024-01-15T10:00:01.000Z] 📋 Step 2: User Registration and Login
✅ User registered: john_doe
{
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "tokenBalance": 0,
    "sustainabilityScore": 0
  },
  "token": "..."
}
──────────────────────────────────────────────────

[2024-01-15T10:00:02.000Z] 📋 Step 3: Package Creation
✅ Package created: PKG_2024_001
{
  "package": {
    "id": "...",
    "packageId": "PKG_2024_001",
    "status": "manufactured",
    "sustainabilityScore": 85
  }
}
──────────────────────────────────────────────────

[2024-01-15T10:00:03.000Z] 📋 Step 4: Package Tracking Simulation
✅ Package location updated: PKG_2024_001
✅ NFC scan simulated: NFC_MUM_001
✅ Sensor data simulated: temperature for PKG_2024_001
──────────────────────────────────────────────────

[2024-01-15T10:00:04.000Z] 📋 Step 5: Package Returns and Token Rewards
✅ Package returned: PKG_2024_001
{
  "reward": {
    "tokens": 50,
    "sustainabilityPoints": 85,
    "message": "Package returned successfully!"
  }
}
──────────────────────────────────────────────────

🎉 PackChain Simulation Completed Successfully!
📊 Results:
   - Users registered: 2
   - Packages created: 2
   - Tokens generated: 2

🌱 The system is working correctly!
💡 You can now access the frontend at: http://localhost:8080
🔗 API documentation available at: http://localhost:3001/health
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Backend Server Not Starting
```bash
# Check if MongoDB is running
mongod --version

# Check if port 3001 is available
netstat -an | grep 3001

# Check server logs
cd server
npm start
```

#### 2. Database Connection Issues
```bash
# Check MongoDB connection
mongo
# or
mongosh

# Check if database exists
show dbs
use packchain
show collections
```

#### 3. CORS Issues
```bash
# Check if frontend URL is correct in server/.env
FRONTEND_URL=http://localhost:8080
```

#### 4. JWT Token Issues
```bash
# Check JWT secret in server/.env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### 5. Package Dependencies
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd server
rm -rf node_modules package-lock.json
npm install
```

## 📈 Performance Testing

### Load Testing with Multiple Users

```bash
# Run multiple simulations in parallel
for i in {1..10}; do
  node simulation.js &
done
wait
```

### Database Performance Test

```bash
# Test with large dataset
node -e "
const axios = require('axios');
const BASE_URL = 'http://localhost:3001/api';

async function createBulkPackages() {
  const token = 'YOUR_TOKEN';
  const promises = [];
  
  for (let i = 1; i <= 100; i++) {
    promises.push(
      axios.post(\`\${BASE_URL}/packages\`, {
        packageId: \`PKG_BULK_\${i.toString().padStart(3, '0')}\`,
        rfidTag: \`RFID_BULK_\${i}\`,
        type: 'cardboard',
        material: 'Recycled cardboard'
      }, {
        headers: { Authorization: \`Bearer \${token}\` }
      })
    );
  }
  
  const results = await Promise.all(promises);
  console.log(\`Created \${results.length} packages\`);
}

createBulkPackages();
"
```

## 🎯 Validation Checklist

After running the simulation, verify:

- [ ] ✅ Backend server starts without errors
- [ ] ✅ Database connection established
- [ ] ✅ User registration works
- [ ] ✅ User login returns JWT token
- [ ] ✅ Package creation successful
- [ ] ✅ Package location updates work
- [ ] ✅ NFC scanning simulation works
- [ ] ✅ IoT sensor data simulation works
- [ ] ✅ Package returns generate tokens
- [ ] ✅ Blockchain status accessible
- [ ] ✅ Analytics dashboard works
- [ ] ✅ WebSocket real-time updates work
- [ ] ✅ Frontend loads without errors
- [ ] ✅ All API endpoints respond correctly

## 🚀 Next Steps

After successful simulation:

1. **Explore the Frontend**: Visit http://localhost:8080
2. **Test Real-time Features**: Monitor WebSocket connections
3. **Customize Data**: Modify simulation data in `simulation.js`
4. **Scale Testing**: Run with more users and packages
5. **Integration Testing**: Connect with real IoT devices
6. **Production Deployment**: Follow deployment guide in README.md

---

**Happy Testing! 🧪✨**

The PackChain simulation will help you understand how the system works in real-world scenarios and validate all features before deployment. 