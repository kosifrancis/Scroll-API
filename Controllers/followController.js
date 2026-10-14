
const mongoose = require('mongoose');
const Follow = require('../Models/Follow');
const User = require('../Models/User');

// FOLLOW A USER
const followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.userId;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID.'
            });
        }

        if (userId === followerId) {
            return res.status(400).json({
                message: 'You cannot follow yourself.'
            });
        }

        const userToFollow = await User.findById(userId);

        if (!userToFollow) {
            return res.status(404).json({
                message: 'User to follow not found.'
            });
        }

        const follow = await Follow.create({
            follower: followerId,
            following: userId
        });

        return res.status(201).json({
            message: 'User followed successfully.',
            follow
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'You are already following this user.'
            });
        }

        console.error('Follow user error:', error);

        return res.status(500).json({
            message: 'Unable to follow user.'
        });
    }
};


// UNFOLLOW A USER
const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID.'
            });
        }

        const follow = await Follow.findOneAndDelete({
            follower: req.userId,
            following: userId
        });

        if (!follow) {
            return res.status(404).json({
                message: 'You are not following this user.'
            });
        }

        return res.status(200).json({
            message: 'User unfollowed successfully.'
        });
    } catch (error) {
        console.error('Unfollow user error:', error);

        return res.status(500).json({
            message: 'Unable to unfollow user.'
        });
    }
};


// GET A USER'S FOLLOWERS
const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID.'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        const followers = await Follow.find({
            following: userId
        })
            .populate('follower', 'username')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            totalFollowers: followers.length,
            followers
        });
    } catch (error) {
        console.error('Get followers error:', error);

        return res.status(500).json({
            message: 'Unable to retrieve followers.'
        });
    }
};


// GET WHO A USER FOLLOWS
const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID.'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        const following = await Follow.find({
            follower: userId
        })
            .populate('following', 'username')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            totalFollowing: following.length,
            following
        });
    } catch (error) {
        console.error('Get following error:', error);

        return res.status(500).json({
            message: 'Unable to retrieve following list.'
        });
    }
};


module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
};
