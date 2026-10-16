
const mongoose = require('mongoose');
const Bookmark = require('../Models/Bookmark');
const Post = require('../Models/Post');

// SAVE A POST
const savePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        const post = await Post.findById(postId).select('_id');

        if (!post) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        const bookmark = await Bookmark.create({
            user: userId,
            post: postId
        });

        return res.status(201).json({
            message: 'Post saved successfully.',
            bookmark
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'You have already saved this post.'
            });
        }

        console.error('Save post error:', error);

        return res.status(500).json({
            message: 'Unable to save post.'
        });
    }
};


// GET SAVED POSTS
const getSavedPosts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const [bookmarks, total] = await Promise.all([
            Bookmark.find({ user: req.userId })
                .populate({
                    path: 'post',
                    populate: {
                        path: 'author',
                        select: 'username'
                    }
                })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Bookmark.countDocuments({ user: req.userId })
        ]);

        return res.status(200).json({
            message: 'Saved posts retrieved successfully.',
            pagination: {
                page,
                limit,
                totalSavedPosts: total,
                totalPages: Math.ceil(total / limit)
            },
            bookmarks
        });
    } catch (error) {
        console.error('Get saved posts error:', error);

        return res.status(500).json({
            message: 'Unable to retrieve saved posts.'
        });
    }
};


// REMOVE A SAVED POST
const removeSavedPost = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        const bookmark = await Bookmark.findOneAndDelete({
            user: req.userId,
            post: postId
        });

        if (!bookmark) {
            return res.status(404).json({
                message: 'Saved post not found.'
            });
        }

        return res.status(200).json({
            message: 'Saved post removed successfully.'
        });
    } catch (error) {
        console.error('Remove saved post error:', error);

        return res.status(500).json({
            message: 'Unable to remove saved post.'
        });
    }
};


module.exports = {
    savePost,
    getSavedPosts,
    removeSavedPost
};
