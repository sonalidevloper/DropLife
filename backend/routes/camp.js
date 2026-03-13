const express = require('express');
const router = express.Router();
const {
  createCamp,
  getAllCamps,
  getCamp,
  registerForCamp,
  updateCamp,
  deleteCamp
} = require('../controllers/campController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin'), createCamp);
router.get('/', getAllCamps);
router.get('/:id', getCamp);
router.post('/:id/register', protect, registerForCamp);
router.put('/:id', protect, authorize('admin'), updateCamp);
router.delete('/:id', protect, authorize('admin'), deleteCamp);

module.exports = router;