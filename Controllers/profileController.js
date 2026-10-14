
const User = require('../Models/User');

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

        // Only accept fields we explicitly allow
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

        // Validate the username if supplied
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

        // Validate age if supplied
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

        return res.status(500).json({
            message: 'Could not update your profile.'
        });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile
};
