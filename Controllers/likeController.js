
const mongoose = require('mongoose');
const Like = require('../Models/Like');
const Post = require('../Models/post');

const likePost = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        const postExists = await Post.exists({
            _id: postId
        });

        if (!postExists) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        try {
            await Like.create({
                user: req.userId,
                post: postId
            });
        } catch (error) {
            // MongoDB duplicate-key error
            if (error.code === 11000) {
                return res.status(409).json({
                    message: 'You have already liked this post.'
                });
            }

            throw error;
        }

        return res.status(201).json({
            message: 'Post liked successfully!'
        });
    } catch (error) {
        console.error('Like post error:', error.message);

        return res.status(500).json({
            message: 'Could not like this post.'
        });
    }
};


const unlikePost = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        const like = await Like.findOneAndDelete({
            user: req.userId,
            post: postId
        });

        if (!like) {
            return res.status(404).json({
                message: 'You have not liked this post.'
            });
        }

        return res.status(200).json({
            message: 'Post unliked successfully!'
        });
    } catch (error) {
        console.error('Unlike post error:', error.message);

        return res.status(500).json({
            message: 'Could not unlike this post.'
        });
    }
};


const getPostLikes = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        const postExists = await Post.exists({
            _id: postId
        });

        if (!postExists) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        const likes = await Like.find({
            post: postId
        })
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Likes retrieved successfully!',
            totalLikes: likes.length,
            likes
        });
    } catch (error) {
        console.error('Get likes error:', error.message);

        return res.status(500).json({
            message: 'Could not retrieve likes.'
        });
    }
};


module.exports = {
    likePost,
    unlikePost,
    getPostLikes
};
