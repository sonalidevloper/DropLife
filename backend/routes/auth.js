const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  adminLogin,
  getMe,
  registerUser,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many password reset attempts, please try again later.' }
});

router.post('/register', authLimiter, register);
router.post('/register-user', authLimiter, registerUser);
router.post('/login', authLimiter, login);
router.post('/admin/login', authLimiter, adminLogin);
router.get('/me', protect, getMe);
router.post('/forgot-password', passwordLimiter, forgotPassword);
router.put('/reset-password/:token', passwordLimiter, resetPassword);
router.put('/update-password', protect, updatePassword);

module.exports = router;
