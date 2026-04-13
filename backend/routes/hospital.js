const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  registerHospital,
  loginHospital,
  getAllHospitals,
  getNearbyHospitals,
  getHospitalById,
  updateHospital,
  getBloodAvailability,
  updateBloodAvailability,
  createHospitalBloodRequest,
  getHospitalRequests,
  getHospitalDeliveries,
  verifyHospital,
  deleteHospital
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

const hospitalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

router.post('/', hospitalAuthLimiter, registerHospital);
router.post('/login', hospitalAuthLimiter, loginHospital);
router.get('/', getAllHospitals);
router.get('/nearby', getNearbyHospitals);
router.get('/:id', getHospitalById);
router.put('/:id', protect, authorize('hospital', 'admin'), updateHospital);
router.get('/:id/blood-availability', getBloodAvailability);
router.put('/:id/blood-availability', protect, authorize('hospital', 'admin'), updateBloodAvailability);
router.post('/:id/blood-request', protect, authorize('hospital', 'admin'), createHospitalBloodRequest);
router.get('/:id/requests', protect, authorize('hospital', 'admin'), getHospitalRequests);
router.get('/:id/deliveries', protect, authorize('hospital', 'admin'), getHospitalDeliveries);
router.put('/:id/verify', protect, authorize('admin'), verifyHospital);
router.delete('/:id', protect, authorize('admin'), deleteHospital);

router.get('/profile/me', protect, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id);

    res.json({
      success: true,
      data: hospital
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
