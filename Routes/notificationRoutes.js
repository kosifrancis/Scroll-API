const express = require('express');

const { protect } = require('../Middleware/authMiddleware');

const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require('../Controllers/notificationController');

const router = express.Router();

// All notification routes require authentication.
router.use(protect);

// Get the logged-in user's notifications.
router.get('/', getNotifications);

// Mark all notifications as read.
// Keep this route above /:notificationId.
router.patch('/read-all', markAllNotificationsAsRead);

// Mark one notification as read.
router.patch('/:notificationId/read', markNotificationAsRead);

module.exports = router;