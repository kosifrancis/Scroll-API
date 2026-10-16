
const express = require('express');
const { protect } = require('../Middleware/authMiddleware');

const {
    savePost,
    getSavedPosts,
    removeSavedPost
} = require('../Controllers/bookmarkController');

const router = express.Router();

router.use(protect);


router.post('/:postId', savePost);


router.get('/', getSavedPosts);


router.delete('/:postId', removeSavedPost);

module.exports = router;
