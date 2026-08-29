import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Initialize Database
import './config/db.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import deviceRoutes from './routes/device.routes.js';
import planRoutes from './routes/plan.routes.js';
import otpRoutes from './routes/otp.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import esimRoutes from './routes/esim.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiter for API protection
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

// Middleware
app.use(generalLimiter);
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simulated Carrier Provisioning Latency Middleware (gives a realistic telecom feel)
const mockDelay = parseInt(process.env.MOCK_CARRIER_DELAY_MS || '0', 10);
if (mockDelay > 0) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/esim/request') || req.path.startsWith('/api/otp/send')) {
      setTimeout(next, mockDelay);
    } else {
      next();
    }
  });
}

// Root Status
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'eSIM Provisioning & Management System Backend API',
    status: 'ONLINE',
    platform: 'Render.com',
    healthCheck: '/api/health',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'eSIM Provisioning & Management System API',
    version: '1.0.0',
    mode: 'DEMO / SIMULATION INTEGRATION',
    timestamp: new Date().toISOString(),
    supportedCarriers: ['Jio', 'Airtel', 'Vi', 'BSNL', 'Demo Telecom'],
    smdpServer: process.env.SMDP_SERVER || 'smdp.telecom-demo.io'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/esim', esimRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server - Bind to 0.0.0.0 for container / cloud hosting
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 eSIM Management System Backend is running!`);
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`⚡ Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);
});
