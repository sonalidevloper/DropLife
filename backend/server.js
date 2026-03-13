const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
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

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donor', require('./routes/donor'));
app.use('/api/blood-request', require('./routes/bloodRequest'));
app.use('/api/camps', require('./routes/camp'));
app.use('/api/admin', require('./routes/admin'));

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
    ╔════════════════════════════════════════════╗
    ║                                            ║
    ║     🩸 DROPLIFE API Server Running         ║
    ║                                            ║
    ║     Port: ${PORT}                           ║
    ║     Environment: ${process.env.NODE_ENV || 'development'}              ║
    ║                                            ║
    ╚════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});