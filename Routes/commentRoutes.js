
const express = require('express');

const { protect } = require('../Middleware/authMiddleware');

const {
    createComment,
    getPostComments,
    updateComment,
    deleteComment
} = require('../Controllers/commentController');

const router = express.Router();

router.post('/posts/:postId/comments', protect, createComment);

router.get('/posts/:postId/comments', getPostComments);

router.patch('/comments/:commentId', protect, updateComment);

router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
