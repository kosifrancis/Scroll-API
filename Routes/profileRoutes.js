
const express = require('express');

const { protect } = require('../Middleware/authMiddleware');
const upload = require('../Config/upload');


const {
    getMyProfile,
    updateMyProfile,
    updateMyProfilePicture,
    getUserProfile
} = require('../Controllers/profileController');


const router = express.Router();

router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateMyProfile);
router.patch('/me/photo', protect, upload.profilePicture.single('profilePicture'), updateMyProfilePicture);
router.get('/:userId', getUserProfile);

module.exports = router;

