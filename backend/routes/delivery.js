const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getAllDeliveries,
  getMyDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  cancelDelivery,
  getHospitalDeliveries
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('hospital', 'admin'), createDelivery);
router.get('/', protect, authorize('admin'), getAllDeliveries);
router.get('/my', protect, getMyDeliveries);
router.get('/hospital/:hospitalId', protect, authorize('hospital', 'admin'), getHospitalDeliveries);
router.get('/:id', protect, getDeliveryById);
router.put('/:id/status', protect, authorize('admin'), updateDeliveryStatus);
router.put('/:id/cancel', protect, cancelDelivery);

module.exports = router;
