
const express = require('express');

const { protect } = require('../Middleware/authMiddleware');

const {
    likePost,
    unlikePost,
    getPostLikes
} = require('../Controllers/likeController');

const router = express.Router();

// Public route: view the likes on a post
router.get('/:postId', getPostLikes);

// Protected routes: like or unlike a post
router.post('/:postId', protect, likePost);
router.delete('/:postId', protect, unlikePost);

module.exports = router;
