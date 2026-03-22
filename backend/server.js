const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// General API rate limiter (100 req / 15 min per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donor', require('./routes/donor'));
app.use('/api/blood-request', require('./routes/bloodRequest'));
app.use('/api/camps', require('./routes/camp'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/hospitals', require('./routes/hospital'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/deliveries', require('./routes/delivery'));
app.use('/api/analytics', require('./routes/analytics'));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🩸 Welcome to DROPLIFE API - Smart Blood Donation System',
    version: '1.0.0'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  
      DROPLIFE API Server Running                                            
      Port: ${PORT}                           
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});