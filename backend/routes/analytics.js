const express = require('express');
const router = express.Router();

const {
  getOverview,
  getBloodTrends,
  getDonorAnalytics,
  getCampAnalytics,
  getHospitalAnalytics
} = require('../controllers/analyticsController');

router.get('/overview', getOverview);
router.get('/blood-trends', getBloodTrends);
router.get('/donors', getDonorAnalytics);
router.get('/camps', getCampAnalytics);
router.get('/hospitals', getHospitalAnalytics);

module.exports = router;