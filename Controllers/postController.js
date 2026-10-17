
const mongoose = require('mongoose');
const Post = require('../Models/Post');
const Follow = require('../Models/Follow');


const createPost = async (req, res) => {
    try {
        const content =
            typeof req.body.content === 'string'
                ? req.body.content.trim()
                : '';

        const files = req.files || [];

        if (!content && files.length === 0) {
            return res.status(400).json({
                message: 'Add some text or upload a photo or video.'
            });
        }

        if (content.length > 5000) {
            return res.status(400).json({
                message: 'Post content cannot exceed 5000 characters.'
            });
        }

        const media = files.map((file) => ({
            url: `/uploads/${file.filename}`,
            type: file.mimetype.startsWith('video/')
                ? 'video'
                : 'image'
        }));

        const post = await Post.create({
            author: req.userId,
            content,
            media
        });

        await post.populate('author', 'username');

        return res.status(201).json({
            message: 'Post created successfully!',
            post
        });
    } catch (error) {
        console.error('Create post error:', error.message);

        return res.status(500).json({
            message: 'Could not create post.'
        });
    }
};



const getPosts = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 10;

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 50
        ) {
            return res.status(400).json({
                message: 'Page must be positive and limit must be between 1 and 50.'
            });
        }

        const skip = (page - 1) * limit;

        const [posts, totalPosts] = await Promise.all([
            Post.find()
                .populate('author', 'username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Post.countDocuments()
        ]);

        return res.status(200).json({
            message: 'Posts retrieved successfully!',
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages: Math.ceil(totalPosts / limit)
            },
            posts
        });
    } catch (error) {
        console.error('Get posts error:', error.message);

        return res.status(500).json({
            message: 'Could not retrieve posts.'
        });
    }
};


const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        const post = await Post.findById(id)
            .populate('author', 'username');

        if (!post) {
            return res.status(404).json({
                message: 'Post not found.'
            });
        }

        return res.status(200).json({
            message: 'Post retrieved successfully!',
            post
        });
    } catch (error) {
        console.error('Get post error:', error.message);

        return res.status(500).json({
            message: 'Could not retrieve post.'
        });
    }
};

const recordPostView = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid post ID.' });
        }

        const post = await Post.findByIdAndUpdate(
            id,
            { $inc: { viewsCount: 1 } },
            { new: true, projection: { viewsCount: 1 } }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        return res.status(200).json({ viewsCount: post.viewsCount });
    } catch (error) {
        console.error('Record post view error:', error.message);
        return res.status(500).json({ message: 'Could not record this view.' });
    }
};


const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        if (typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({
                message: 'Post content is required.'
            });
        }

        if (content.trim().length > 5000) {
            return res.status(400).json({
                message: 'Post content cannot exceed 5000 characters.'
            });
        }

        const post = await Post.findOne({
            _id: id,
            author: req.userId
        });

        if (!post) {
            const existingPost = await Post.exists({ _id: id });

            if (!existingPost) {
                return res.status(404).json({
                    message: 'Post not found.'
                });
            }

            return res.status(403).json({
                message: 'You can only edit your own posts.'
            });
        }

        post.content = content.trim();

        await post.save();
        await post.populate('author', 'username');

        return res.status(200).json({
            message: 'Post updated successfully!',
            post
        });
    } catch (error) {
        console.error('Update post error:', error.message);

        return res.status(500).json({
            message: 'Could not update post.'
        });
    }
};


const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid post ID.'
            });
        }

        const post = await Post.findOneAndDelete({
            _id: id,
            author: req.userId
        });

        if (!post) {
            const existingPost = await Post.exists({ _id: id });

            if (!existingPost) {
                return res.status(404).json({
                    message: 'Post not found.'
                });
            }

            return res.status(403).json({
                message: 'You can only delete your own posts.'
            });
        }

        return res.status(200).json({
            message: 'Post deleted successfully!'
        });
    } catch (error) {
        console.error('Delete post error:', error.message);

        return res.status(500).json({
            message: 'Could not delete post.'
        });
    }
};

const getFeed = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 10;

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 50
        ) {
            return res.status(400).json({
                message: 'Page must be positive and limit must be between 1 and 50.'
            });
        }

        const skip = (page - 1) * limit;

        const following = await Follow.find({
            follower: req.userId
        }).select('following');

        const followingIds = following.map(
            (follow) => follow.following
        );

        const feedUserIds = [
            req.userId,
            ...followingIds
        ];

        const [posts, totalPosts] = await Promise.all([
            Post.find({
                author: { $in: feedUserIds }
            })
                .populate('author', 'username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Post.countDocuments({
                author: { $in: feedUserIds }
            })
        ]);

        return res.status(200).json({
            message: 'Feed retrieved successfully!',
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages: Math.ceil(totalPosts / limit)
            },
            posts
        });
    } catch (error) {
        console.error('Get feed error:', error.message);

        return res.status(500).json({
            message: 'Could not retrieve feed.'
        });
    }
};
module.exports = {
    createPost,
    getPosts,
    getPostById,
    recordPostView,
    updatePost,
    deletePost,
    getFeed
};

