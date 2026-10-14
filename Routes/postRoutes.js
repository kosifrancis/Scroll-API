
const express = require('express');

const { protect } = require('../Middleware/authMiddleware');

const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
} = require('../Controllers/postController');

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/:id', getPostById);

// Protected routes
router.post('/', protect, createPost);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
