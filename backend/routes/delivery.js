const express = require('express');
const router = express.Router();

const {
  createDelivery,
  getDeliveries,
  getDelivery,
  updateDeliveryStatus,
  trackDelivery,
  deleteDelivery
} = require('../controllers/deliveryController');

const { protect, authorize } = require('../middleware/auth');

// Public tracking (no auth needed)
router.get('/track/:trackingId', trackDelivery);

// Authenticated routes
router.post('/', protect, authorize('hospital', 'admin'), createDelivery);

router.get('/', protect, authorize('admin'), getDeliveries);

router.get('/:id', protect, getDelivery);

router.put('/:id/status', protect, authorize('admin'), updateDeliveryStatus);

router.delete('/:id', protect, authorize('admin'), deleteDelivery);

module.exports = router;