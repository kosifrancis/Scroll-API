
const express = require('express');

const { protect } = require('../Middleware/authMiddleware');
const upload = require('../Config/upload');

const {
    createPost,
    getPosts,
    getPostById,
    recordPostView,
    updatePost,
    deletePost,
    getFeed
} = require('../Controllers/postController');

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/feed', protect, getFeed);
router.get('/:id', getPostById);
router.post('/:id/view', recordPostView);

// Protected routes
router.post(
    '/',
    protect,
    upload.array('media', 5),
    createPost
);

router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;

