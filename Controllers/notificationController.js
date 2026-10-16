const mongoose = require('mongoose');
const Notification = require('../Models/Notification');

const getNotifications = async (req, res) => {
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

        const filter = {
            recipient: req.userId
        };

        const [notifications, totalNotifications, unreadCount] =
            await Promise.all([
                Notification.find(filter)
                    .populate('sender', 'username')
                    .populate('post', 'content')
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit),

                Notification.countDocuments(filter),

                Notification.countDocuments({
                    ...filter,
                    isRead: false
                })
            ]);

        return res.status(200).json({
            message: 'Notifications retrieved successfully!',
            pagination: {
                page,
                limit,
                totalNotifications,
                totalPages: Math.ceil(totalNotifications / limit)
            },
            unreadCount,
            notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error.message);

        return res.status(500).json({
            message: 'Could not retrieve notifications.'
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!mongoose.isValidObjectId(notificationId)) {
            return res.status(400).json({
                message: 'Invalid notification ID.'
            });
        }

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: req.userId
            },
            {
                $set: { isRead: true }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found.'
            });
        }

        return res.status(200).json({
            message: 'Notification marked as read.',
            notification
        });
    } catch (error) {
        console.error('Mark notification read error:', error.message);

        return res.status(500).json({
            message: 'Could not mark notification as read.'
        });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            {
                recipient: req.userId,
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        return res.status(200).json({
            message: 'All notifications marked as read.',
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark all notifications read error:', error.message);

        return res.status(500).json({
            message: 'Could not mark notifications as read.'
        });
    }
};

module.exports = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};