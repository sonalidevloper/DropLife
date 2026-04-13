const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

// ─── Protect routes ────────────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorised to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hospital tokens have role: 'hospital' embedded at sign time
    if (decoded.role === 'hospital') {
      const hospital = await Hospital.findById(decoded.id).select('-password');
      if (!hospital) {
        return res.status(401).json({ success: false, message: 'Hospital not found' });
      }
      // Expose as req.user so existing controller code works uniformly
      req.user = { ...hospital.toObject(), role: 'hospital' };
      req.user.id = hospital._id.toString();
      return next();
    }

    // Regular user / admin token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorised to access this route'
    });
  }
};

// ─── Role guard ────────────────────────────────────────────────────────────
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorised to access this route`
      });
    }
    next();
  };
};