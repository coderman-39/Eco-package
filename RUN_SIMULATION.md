# 🚀 PackChain Simulation - Step by Step Guide

This guide will walk you through running a complete simulation of the PackChain system to test all features in a real-world scenario.

## 📋 Prerequisites Check

First, ensure you have all required software installed:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed
mongod --version
```

## 🛠️ Step 1: Setup the Environment

### 1.1 Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install manually:
npm install
cd server && npm install && cd ..
```

### 1.2 Setup Environment Variables
```bash
# Create .env file in server directory
cd server
echo "PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/packchain
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:8080" > .env
cd ..
```

### 1.3 Start MongoDB
```bash
# Start MongoDB locally
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

## 🚀 Step 2: Start the Backend Server

```bash
# Start the backend server
cd server
npm start
```

You should see output like:
```
🚀 PackChain Backend Server running on port 3001
📊 MongoDB connected successfully
🔗 WebSocket server initialized
```

**Keep this terminal window open!**

## 🧪 Step 3: Run the Simulation

### Option A: Quick Test (Recommended for first run)
Open a new terminal window and run:

```bash
# Quick functionality test
npm run quick-test
```

This will test:
- ✅ System health
- ✅ User registration
- ✅ User login
- ✅ Package creation
- ✅ Blockchain status
- ✅ Analytics

### Option B: Full Simulation
For a comprehensive test with multiple users and packages:

```bash
# Full end-to-end simulation
npm run simulate
```

This will test:
- ✅ Complete user lifecycle
- ✅ Package tracking with location updates
- ✅ NFC/RFID scanning simulation
- ✅ IoT sensor data simulation
- ✅ Package returns and token rewards
- ✅ Real-time WebSocket updates
- ✅ Blockchain transactions
- ✅ Analytics and reporting

## 📊 Step 4: Verify Results

### Expected Quick Test Output:
```
🧪 Quick PackChain Test

1️⃣ Testing health check...
✅ Health check passed: healthy

2️⃣ Testing user registration...
✅ User registered: quicktest

3️⃣ Testing user login...
✅ Login successful, token received

4️⃣ Testing package creation...
✅ Package created: PKG_QUICK_001

5️⃣ Testing blockchain status...
✅ Blockchain status: active

6️⃣ Testing analytics...
✅ Analytics working, total packages: 1

🎉 All tests passed! PackChain is working correctly.
💡 Access the frontend at: http://localhost:8080
🔗 API health check: http://localhost:3001/health
```

### Expected Full Simulation Output:
```
🚀 Starting PackChain Simulation...

[timestamp] 📋 Step 1: System Health Check
✅ Health check passed
{
  "status": "healthy",
  "timestamp": "...",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "blockchain": "simulated",
    "iot": "simulated"
  }
}

[timestamp] 📋 Step 2: User Registration and Login
✅ User registered: john_doe
✅ User logged in: john@example.com

[timestamp] 📋 Step 3: Package Creation
✅ Package created: PKG_2024_001

[timestamp] 📋 Step 4: Package Tracking Simulation
✅ Package location updated: PKG_2024_001
✅ NFC scan simulated: NFC_MUM_001
✅ Sensor data simulated: temperature for PKG_2024_001

[timestamp] 📋 Step 5: Package Returns and Token Rewards
✅ Package returned: PKG_2024_001
{
  "reward": {
    "tokens": 50,
    "sustainabilityPoints": 85,
    "message": "Package returned successfully!"
  }
}

🎉 PackChain Simulation Completed Successfully!
📊 Results:
   - Users registered: 2
   - Packages created: 2
   - Tokens generated: 2

🌱 The system is working correctly!
```

## 🌐 Step 5: Test the Frontend (Optional)

### 5.1 Start the Frontend
Open another terminal window:

```bash
# Start the frontend development server
npm run dev:frontend
```

### 5.2 Access the Application
Open your browser and go to:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### 5.3 Test Frontend Features
1. **Register/Login**: Create a new account or use test credentials
2. **Dashboard**: View package tracking and analytics
3. **Package Tracker**: Monitor package locations and status
4. **Token Wallet**: Check earned tokens and sustainability score
5. **Leaderboard**: View user rankings
6. **Blockchain Network**: Monitor network status

## 🔄 Step 6: Real-time Testing

### 6.1 WebSocket Testing
Open browser console and run:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3001');

// Listen for updates
socket.on('connect', () => {
  console.log('✅ Connected to PackChain WebSocket');
});

socket.on('package_update', (data) => {
  console.log('📦 Package update:', data);
});

socket.on('token_reward', (data) => {
  console.log('🏆 Token reward:', data);
});
```

### 6.2 Manual API Testing
Test individual endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Get all packages
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/packages

# Get blockchain status
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/blockchain/status
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Connection refused" errors
```bash
# Check if backend is running
curl http://localhost:3001/health

# Restart backend
cd server && npm start
```

#### 2. "MongoDB connection failed"
```bash
# Check if MongoDB is running
mongod --version
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

#### 3. "Port already in use"
```bash
# Check what's using port 3001
netstat -an | grep 3001

# Kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

#### 4. "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd server
rm -rf node_modules package-lock.json
npm install
```

## 📈 Performance Testing

### Load Testing
```bash
# Run multiple simulations
for i in {1..5}; do
  npm run quick-test &
done
wait
```

### Database Testing
```bash
# Check database performance
mongo packchain --eval "db.packages.count()"
mongo packchain --eval "db.users.count()"
```

## ✅ Validation Checklist

After running the simulation, verify:

- [ ] ✅ Backend server starts without errors
- [ ] ✅ Database connection established
- [ ] ✅ Health check endpoint responds
- [ ] ✅ User registration works
- [ ] ✅ User login returns JWT token
- [ ] ✅ Package creation successful
- [ ] ✅ Package tracking updates work
- [ ] ✅ NFC scanning simulation works
- [ ] ✅ IoT sensor data simulation works
- [ ] ✅ Package returns generate tokens
- [ ] ✅ Blockchain status accessible
- [ ] ✅ Analytics dashboard works
- [ ] ✅ WebSocket real-time updates work
- [ ] ✅ Frontend loads without errors

## 🎯 Next Steps

After successful simulation:

1. **Explore Features**: Test all frontend components
2. **Customize Data**: Modify simulation parameters
3. **Scale Testing**: Test with more users/packages
4. **Integration**: Connect real IoT devices
5. **Deployment**: Follow production deployment guide

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all prerequisites are installed
4. Check the detailed `SIMULATION_GUIDE.md`
5. Review the main `README.md` for setup instructions

---

**Happy Simulating! 🚀✨**

The PackChain simulation will help you understand how the system works and validate all features before real-world deployment. 