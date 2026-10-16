
const mongoose = require('mongoose');
const User = require('../Models/User');
const Post = require('../Models/Post');
const Follow = require('../Models/Follow');

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            message: 'Profile retrieved successfully!',
            user
        });
    } catch (error) {
        console.error('Profile error:', error.message);

        return res.status(500).json({
            message: 'Could not retrieve your profile.'
        });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const allowedFields = ['username', 'age'];
        const updates = {};

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'Provide a username or age to update.'
            });
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'username')) {
            if (
                typeof updates.username !== 'string' ||
                !updates.username.trim()
            ) {
                return res.status(400).json({
                    message: 'Username must be a non-empty string.'
                });
            }

            updates.username = updates.username.trim();
        }

        if (Object.prototype.hasOwnProperty.call(updates, 'age')) {
            const age = updates.age;

            if (
                !Number.isInteger(age) ||
                age < 13 ||
                age > 120
            ) {
                return res.status(400).json({
                    message: 'Age must be a whole number between 13 and 120.'
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            message: 'Profile updated successfully!',
            user
        });
    } catch (error) {
        console.error('Profile update error:', error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'That username is already taken.'
            });
        }

        return res.status(500).json({
            message: 'Could not update your profile.'
        });
    }
};

// View another user's public profile


// View another user's public profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID.'
            });
        }

        const user = await User.findById(userId)
            .select('username age createdAt')
            .lean();

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        const [posts, followersCount, followingCount] =
            await Promise.all([
                Post.find({ author: userId })
                    .sort({ createdAt: -1 })
                    .limit(50)
                    .lean(),

                Follow.countDocuments({
                    following: userId
                }),

                Follow.countDocuments({
                    follower: userId
                })
            ]);

        return res.status(200).json({
            message: 'Public profile retrieved successfully!',
            profile: {
                ...user,
                posts,
                followersCount,
                followingCount
            }
        });
    } catch (error) {
        console.error('Public profile error:', error.message);

        return res.status(500).json({
            message: 'Could not retrieve public profile.'
        });
    }
};


module.exports = {
    getMyProfile,
    updateMyProfile,
    getUserProfile
};
