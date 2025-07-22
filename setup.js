#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 PackChain Setup Script');
console.log('========================\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js ${nodeVersion} detected`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js 18+ first.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm ${npmVersion} detected`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm first.');
  process.exit(1);
}

// Create server directory if it doesn't exist
const serverDir = path.join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
  console.log('✅ Created server directory');
}

// Create uploads directory
const uploadsDir = path.join(serverDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Create .env file if it doesn't exist
const envPath = path.join(serverDir, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# PackChain Environment Variables

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/packchain

# JWT Configuration
JWT_SECRET=packchain-super-secret-key-2024-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# File Upload Configuration
UPLOAD_PATH=./server/uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Blockchain Configuration (for simulation)
BLOCKCHAIN_NETWORK_NAME=PackChain
BLOCKCHAIN_CONSENSUS=RAFT
BLOCKCHAIN_CHANNEL=packchain-channel

# IoT Configuration
IOT_NETWORK_NAME=PackChain-IoT
IOT_DEVICE_TIMEOUT=86400000
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration');
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { cwd: serverDir, stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Start MongoDB: mongod');
console.log('2. Start the application: npm run dev');
console.log('3. Access the app at: http://localhost:8080');
console.log('4. API health check: http://localhost:3001/health');
console.log('\n📚 For more information, see README.md'); 