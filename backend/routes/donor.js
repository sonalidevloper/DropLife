const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateAvailability,
  getDonationHistory,
  getNearbyDonors
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/availability', protect, updateAvailability);
router.get('/history', protect, getDonationHistory);
router.get('/nearby', protect, authorize('admin'), getNearbyDonors);

module.exports = router;