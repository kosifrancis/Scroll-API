const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Scroll, The Future');
});

module.exports = router;