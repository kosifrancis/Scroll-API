
const mongoose = require('mongoose');
const Comment = require('../Models/comment');
const Post = require('../Models/post');

// CREATE A COMMENT
const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        if (
            typeof content !== 'string' ||
            !content.trim() ||
            content.trim().length > 2000
        ) {
            return res.status(400).json({
                message: 'Comment must contain 1–2000 characters.'
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        const comment = await Comment.create({
            author: req.userId,
            post: postId,
            content: content.trim()
        });

        await comment.populate('author', 'username');

        return res.status(201).json({
            message: 'Comment created successfully.',
            comment
        });
    } catch (error) {
        console.error('Create comment error:', error);

        return res.status(500).json({
            message: 'Unable to create comment.'
        });
    }
};


// GET COMMENTS FOR A POST
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const skip = (page - 1) * limit;

        const [comments, totalComments] = await Promise.all([
            Comment.find({ post: postId })
                .populate('author', 'username')
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit),

            Comment.countDocuments({ post: postId })
        ]);

        return res.status(200).json({
            totalComments,
            page,
            totalPages: Math.ceil(totalComments / limit),
            comments
        });
    } catch (error) {
        console.error('Get comments error:', error);

        return res.status(500).json({
            message: 'Unable to retrieve comments.'
        });
    }
};


// UPDATE YOUR OWN COMMENT
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        if (!mongoose.isValidObjectId(commentId)) {
            return res.status(400).json({
                message: 'Invalid comment ID.'
            });
        }

        if (
            typeof content !== 'string' ||
            !content.trim() ||
            content.trim().length > 2000
        ) {
            return res.status(400).json({
                message: 'Comment must contain 1–2000 characters.'
            });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found.'
            });
        }

        if (comment.author.toString() !== req.userId) {
            return res.status(403).json({
                message: 'You can only edit your own comments.'
            });
        }

        comment.content = content.trim();

        await comment.save();
        await comment.populate('author', 'username');

        return res.status(200).json({
            message: 'Comment updated successfully.',
            comment
        });
    } catch (error) {
        console.error('Update comment error:', error);

        return res.status(500).json({
            message: 'Unable to update comment.'
        });
    }
};


// DELETE YOUR OWN COMMENT
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!mongoose.isValidObjectId(commentId)) {
            return res.status(400).json({
                message: 'Invalid comment ID.'
            });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found.'
            });
        }

        if (comment.author.toString() !== req.userId) {
            return res.status(403).json({
                message: 'You can only delete your own comments.'
            });
        }

        await comment.deleteOne();

        return res.status(200).json({
            message: 'Comment deleted successfully.'
        });
    } catch (error) {
        console.error('Delete comment error:', error);

        return res.status(500).json({
            message: 'Unable to delete comment.'
        });
    }
};


module.exports = {
    createComment,
    getPostComments,
    updateComment,
    deleteComment
};
