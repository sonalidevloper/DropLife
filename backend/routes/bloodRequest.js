const express = require('express');
const router = express.Router();
const {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequest,
  updateBloodRequestStatus,
  respondToBloodRequest,
  getMyBloodRequests,
  cancelBloodRequest
} = require('../controllers/bloodRequestController');
const { protect } = require('../middleware/auth');

router.post('/', createBloodRequest);
router.get('/', getAllBloodRequests);
router.get('/my', protect, getMyBloodRequests);
router.get('/:id', getBloodRequest);
router.put('/:id/status', protect, updateBloodRequestStatus);
router.put('/:id/respond', protect, respondToBloodRequest);
router.put('/:id/cancel', protect, cancelBloodRequest);

module.exports = router;