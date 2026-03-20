const express = require('express');
const router = express.Router();
const {
  getBloodStats,
  getDonationTrends,
  getHospitalStats,
  getRequestStats,
  getGeographicStats
} = require('../controllers/analyticsController');

router.get('/blood-stats', getBloodStats);
router.get('/donation-trends', getDonationTrends);
router.get('/hospital-stats', getHospitalStats);
router.get('/request-stats', getRequestStats);
router.get('/geographic', getGeographicStats);

module.exports = router;
