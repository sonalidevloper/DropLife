const express = require('express');
const router  = express.Router();
const {
  getNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All notification routes require authentication
router.use(protect);

router.get('/unread-count', protect, async (req, res) => {
  try {
    res.json({ count: 0 }); // temporary
  } catch (err) {
    res.status(500).json({ message: 'Error fetching count' });
  }
});
router.get('/', (req, res) => res.json([]));
router.put('/mark-read/:id',     markOneRead);
router.put('/mark-all-read',     markAllRead);
router.delete('/clear/all',      clearAllNotifications);
router.delete('/:id',            deleteNotification);

module.exports = router;