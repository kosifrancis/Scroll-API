
const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Scroll API is healthy!'
    });
});

module.exports = router;
