
const express = require('express');

const { protect } = require('../Middleware/authMiddleware');

const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} = require('../Controllers/followController');

const router = express.Router();

// Follow another user
router.post('/:userId', protect, followUser);

// Unfollow a user
router.delete('/:userId', protect, unfollowUser);

// View a user's followers
router.get('/:userId/followers', getFollowers);

// View the users someone follows
router.get('/:userId/following', getFollowing);

module.exports = router;
