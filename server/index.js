import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import packageRoutes from './routes/packages.js';
import userRoutes from './routes/users.js';
import blockchainRoutes from './routes/blockchain.js';
import iotRoutes from './routes/iot.js';
import analyticsRoutes from './routes/analytics.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import services
import { initializeBlockchain } from './services/blockchain.js';
import { initializeIoT } from './services/iot.js';

// Import models
import './models/User.js';
import './models/Package.js';
import './models/Transaction.js';
import './models/Token.js';
import './models/Leaderboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/packchain';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', authenticateToken, packageRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/blockchain', authenticateToken, blockchainRoutes);
app.use('/api/iot', authenticateToken, iotRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle package tracking updates
  socket.on('track-package', (packageId) => {
    socket.join(`package-${packageId}`);
    console.log(`Client ${socket.id} tracking package ${packageId}`);
  });

  // Handle NFC scan simulation
  socket.on('nfc-scan', async (data) => {
    try {
      // Simulate NFC scan processing
      setTimeout(() => {
        socket.emit('nfc-result', {
          success: true,
          packageId: data.packageId,
          timestamp: new Date().toISOString()
        });
      }, 2000);
    } catch (error) {
      socket.emit('nfc-result', {
        success: false,
        error: error.message
      });
    }
  });

  // Handle blockchain transaction monitoring
  socket.on('monitor-transaction', (txHash) => {
    socket.join(`tx-${txHash}`);
    console.log(`Client ${socket.id} monitoring transaction ${txHash}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Use an async function to start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Initialize services
    await initializeBlockchain(); // Ensure Fabric connection is up before starting server
    initializeIoT();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 PackChain Backend Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start the server
startServer();

// Export for testing
export { app, io }; 