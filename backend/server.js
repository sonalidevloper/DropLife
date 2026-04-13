const express = require('express');
const dotenv  = require('dotenv');
const cors    = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ── Body parser ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Existing routes ───────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/donor',         require('./routes/donor'));
app.use('/api/blood-request', require('./routes/bloodRequest'));
app.use('/api/camps',         require('./routes/camp'));
app.use('/api/admin',         require('./routes/admin'));

// ── New routes (add these) ────────────────────────────────────────
app.use('/api/hospitals',     require('./routes/hospital'));
app.use('/api/blood-stock',   require('./routes/bloodStock'));
app.use('/api/notification',  require('./routes/notification'));
app.use('/api/delivery',      require('./routes/delivery'));
app.use('/api/analytics',     require('./routes/analytics'));

// ── Welcome route ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🩸 Welcome to DROPLIFE API - Smart Blood Donation System',
    version: '2.0.0',
    routes: [
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'GET    /api/donor/profile',
      'GET    /api/blood-request',
      'GET    /api/blood-stock',
      'GET    /api/hospitals/public',
      'GET    /api/notification',
      'GET    /api/camps',
    ],
  });
});

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// ── Start server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`
DROPLIFE API Server Running
Port:        ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});