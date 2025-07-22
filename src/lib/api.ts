import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
  verifyToken: () => api.get('/auth/verify'),
};

// Package API
export const packageAPI = {
  getAll: (params?: any) => api.get('/packages', { params }),
  getById: (packageId: string) => api.get(`/packages/${packageId}`),
  create: (data: any) => api.post('/packages', data),
  updateLocation: (packageId: string, data: any) => 
    api.put(`/packages/${packageId}/update-location`, data),
  return: (packageId: string, data: any) => 
    api.post(`/packages/${packageId}/return`, data),
  scan: (data: any) => api.post('/packages/scan', data),
  getByStatus: (status: string, limit?: number) => 
    api.get(`/packages/status/${status}`, { params: { limit } }),
  getNearLocation: (longitude: number, latitude: number, maxDistance?: number) =>
    api.get(`/packages/near/${longitude}/${latitude}`, { params: { maxDistance } }),
  getAnalytics: () => api.get('/packages/analytics/overview'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getPackages: (params?: any) => api.get('/users/packages', { params }),
  getTokenTransactions: () => api.get('/users/tokens/transactions'),
  spendTokens: (data: any) => api.post('/users/tokens/spend', data),
  getLeaderboard: (type?: string, limit?: number) => 
    api.get('/users/leaderboard', { params: { type, limit } }),
  getStats: () => api.get('/users/stats'),
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (userId: string) => api.get(`/users/${userId}`),
  update: (userId: string, data: any) => api.put(`/users/${userId}`, data),
};

// Blockchain API
export const blockchainAPI = {
  getStatus: () => api.get('/blockchain/status'),
  getNodes: () => api.get('/blockchain/nodes'),
  getContracts: () => api.get('/blockchain/contracts'),
  createTransaction: (data: any) => api.post('/blockchain/transaction', data),
  getTransaction: (txHash: string) => api.get(`/blockchain/transaction/${txHash}`),
  getTransactions: (params?: any) => api.get('/blockchain/transactions', { params }),
  getWalletBalance: (address: string) => api.get(`/blockchain/wallet/${address}`),
  getAnalytics: () => api.get('/blockchain/analytics'),
  simulateUpdate: () => api.post('/blockchain/simulate-update'),
};

// IoT API
export const iotAPI = {
  scan: (data: any) => api.post('/iot/scan', data),
  updateSensorData: (packageId: string, data: any) => 
    api.put(`/iot/sensor-data/${packageId}`, data),
  getDevicesStatus: (limit?: number) => 
    api.get('/iot/devices/status', { params: { limit } }),
  getAnalytics: () => api.get('/iot/analytics'),
  simulateUpdate: (data: any) => api.post('/iot/simulate-update', data),
  getAlerts: () => api.get('/iot/alerts'),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getEnvironmental: (period?: string) => 
    api.get('/analytics/environmental', { params: { period } }),
  getEngagement: () => api.get('/analytics/engagement'),
  getLifecycle: () => api.get('/analytics/lifecycle'),
  getRealtime: () => api.get('/analytics/realtime'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Socket.io connection for real-time updates
export const connectSocket = () => {
  const socket = new (window as any).io(API_BASE_URL.replace('/api', ''), {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Connected to PackChain WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from PackChain WebSocket');
  });

  return socket;
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  delete api.defaults.headers.common.Authorization;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

export default api; 