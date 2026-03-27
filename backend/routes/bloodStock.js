const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Blood stock route working');
});

module.exports = router;