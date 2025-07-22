# 🚀 PackChain - Full-Stack Sustainable Packaging Platform

A comprehensive blockchain-powered platform for tracking IoT-tagged packages and rewarding sustainable practices. Built with React, Node.js, MongoDB, and Hyperledger Fabric simulation.

## 🌟 Features

### 🔐 Authentication & User Management
- JWT-based authentication
- User registration and profile management
- Role-based access control (Customer, Seller, Logistics, Admin)
- Password change and account verification

### 📦 Package Tracking & IoT Integration
- Real-time package tracking with RFID/NFC tags
- IoT sensor data monitoring (temperature, humidity, shock, light)
- Package lifecycle management (manufactured → dispatched → delivered → returned)
- Environmental impact scoring
- Location-based package search

### 🏆 Gamification & Rewards
- Green token rewards for package returns
- Sustainability scoring system
- Achievement badges and milestones
- Leaderboards (users, cities, sellers)
- Token redemption system

### ⛓️ Blockchain Integration
- Hyperledger Fabric simulation
- Smart contract management
- Token transactions and wallet management
- Network health monitoring
- Real-time transaction tracking

### 📊 Analytics & Reporting
- Real-time dashboard analytics
- Environmental impact metrics
- User engagement analytics
- Package lifecycle analytics
- IoT device health monitoring

### 🔌 Real-time Features
- WebSocket connections for live updates
- Real-time package status updates
- Live IoT sensor data
- Instant token rewards
- Real-time leaderboard updates

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   WebSocket     │◄─────────────┘
                        │   (Socket.io)   │
                        └─────────────────┘
                                │
                        ┌─────────────────┐
                        │   IoT Network   │
                        │   (Simulated)   │
                        └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **React Query** for data fetching
- **React Router** for navigation
- **Socket.io Client** for real-time updates
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **multer** for file uploads
- **helmet** for security

### Database
- **MongoDB** with geospatial indexing
- **Mongoose** schemas with validation
- **Indexes** for performance optimization

### Blockchain (Simulation)
- **Hyperledger Fabric** simulation
- **Smart contracts** for token management
- **RAFT consensus** simulation
- **Multi-organization** network

### IoT (Simulation)
- **NFC/RFID** tag simulation
- **Sensor data** generation
- **Device health** monitoring
- **Real-time alerts**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+ (local or cloud)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd eco-package-chain-rewards-main
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the server directory:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/packchain

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

### 4. Start MongoDB
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```

### 5. Start the Application
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### 6. Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📁 Project Structure

```
eco-package-chain-rewards-main/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── PackChainDashboard.tsx
│   │   ├── PackageTracker.tsx
│   │   ├── TokenWallet.tsx
│   │   ├── LeaderBoard.tsx
│   │   └── BlockchainNetwork.tsx
│   ├── pages/                    # Route components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and API
│   │   ├── api.ts               # API client
│   │   └── utils.ts             # Utility functions
│   └── main.tsx                 # Entry point
├── server/                       # Backend source code
│   ├── models/                   # MongoDB schemas
│   │   ├── User.js
│   │   ├── Package.js
│   │   ├── Transaction.js
│   │   ├── Token.js
│   │   └── Leaderboard.js
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── packages.js
│   │   ├── users.js
│   │   ├── blockchain.js
│   │   ├── iot.js
│   │   └── analytics.js
│   ├── middleware/               # Express middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── services/                 # Business logic
│   │   ├── blockchain.js
│   │   └── iot.js
│   └── index.js                  # Server entry point
├── package.json                  # Frontend dependencies
├── server/package.json           # Backend dependencies
└── README.md                     # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get package by ID
- `POST /api/packages` - Create new package
- `PUT /api/packages/:id/update-location` - Update package location
- `POST /api/packages/:id/return` - Process package return
- `POST /api/packages/scan` - Scan NFC/RFID tag

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/packages` - Get user's packages
- `GET /api/users/leaderboard` - Get leaderboard
- `POST /api/users/tokens/spend` - Spend tokens

### Blockchain
- `GET /api/blockchain/status` - Get network status
- `GET /api/blockchain/nodes` - Get network nodes
- `POST /api/blockchain/transaction` - Create transaction
- `GET /api/blockchain/wallet/:address` - Get wallet balance

### IoT
- `POST /api/iot/scan` - Simulate NFC/RFID scan
- `GET /api/iot/devices/status` - Get device status
- `GET /api/iot/alerts` - Get IoT alerts

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/environmental` - Get environmental metrics
- `GET /api/analytics/realtime` - Get real-time data

## 🎯 Key Features Demo

### 1. User Registration & Authentication
```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Package Tracking
```bash
# Create a new package
curl -X POST http://localhost:3001/api/packages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "PKG001",
    "rfidTag": "RFID_A123B456",
    "type": "cardboard",
    "material": "Recycled cardboard"
  }'
```

### 3. NFC/RFID Scanning
```bash
# Simulate NFC scan
curl -X POST http://localhost:3001/api/iot/scan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tagId": "RFID_A123B456"
  }'
```

### 4. Package Return & Token Rewards
```bash
# Return a package
curl -X POST http://localhost:3001/api/packages/PKG001/return \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "coordinates": [77.2090, 28.6139],
      "facility": "Flipkart Locker - Delhi"
    },
    "condition": "good"
  }'
```

## 🔒 Security Features

- **JWT Authentication** with token expiration
- **Password Hashing** with bcrypt
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet Security** headers
- **SQL Injection Protection** with Mongoose
- **XSS Protection** with proper input sanitization

## 📊 Database Schema

### User Collection
- Authentication details (username, email, password)
- Profile information (name, location, avatar)
- Token balance and sustainability metrics
- Achievements and badges
- Blockchain wallet address

### Package Collection
- Package identification (ID, RFID, NFC tags)
- Current status and location
- Tracking history with timestamps
- IoT sensor data
- Environmental impact metrics
- Blockchain transaction references

### Transaction Collection
- Blockchain transaction details
- Token transfers and rewards
- Smart contract interactions
- Gas usage and block information

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
# Upload dist/ folder
```

### Backend Deployment
```bash
# Set production environment variables
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret

# Start production server
npm start
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t packchain .
docker run -p 3001:3001 packchain
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- [ ] Real Hyperledger Fabric integration
- [ ] Physical IoT device integration
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Machine learning for package optimization
- [ ] Integration with other e-commerce platforms
- [ ] Carbon credit trading system
- [ ] Advanced gamification features

---

**PackChain** - Transforming packaging into a sustainable, trackable ecosystem! 🌱♻️
