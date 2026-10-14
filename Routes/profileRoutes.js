
const express = require('express');

const { protect } = require('../Middleware/authMiddleware');

const {
    getMyProfile,
    updateMyProfile
} = require('../Controllers/profileController');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateMyProfile);

module.exports = router;
