const express = require('express');
const router = express.Router();
const {
  getAllDonors,
  getDashboardStats,
  getBloodStock,
  updateBloodStock,
  verifyDonor,
  deleteDonor
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/donors', getAllDonors);
router.get('/stats', getDashboardStats);
router.get('/blood-stock', getBloodStock);
router.put('/blood-stock/:bloodGroup', updateBloodStock);
router.put('/donors/:id/verify', verifyDonor);
router.delete('/donors/:id', deleteDonor);

module.exports = router;