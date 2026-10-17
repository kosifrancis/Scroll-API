const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');

const homeRoutes = require('./Routes/homeRoutes');
const healthRoutes = require('./Routes/healthRoutes');
const userRoutes = require('./Routes/userRoutes');
const authRoutes = require('./Routes/authRoutes');
const profileRoutes = require('./Routes/profileRoutes');
const postRoutes = require('./Routes/postRoutes');
const likeRoutes = require('./Routes/likeRoutes');
const commentRoutes = require('./Routes/commentRoutes');
const followRoutes = require('./Routes/followRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');
const bookmarkRoutes = require('./Routes/bookmarkRoutes');
const searchRoutes = require('./Routes/searchRoutes');

const app = express();
const allowedOrigins = new Set([
    'https://kosifrancis.github.io',
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGINS || '').split(',')
].map((origin) => origin?.trim().replace(/\/$/, '')).filter(Boolean));

app.use(cors({
    origin(origin, callback) {
        if (
            !origin ||
            process.env.NODE_ENV !== 'production' ||
            allowedOrigins.has(origin.replace(/\/$/, ''))
        ) {
            return callback(null, true);
        }

        return callback(null, false);
    }
}));

app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', homeRoutes);
app.use('/', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/search', searchRoutes);

const frontendDirectory = path.join(__dirname, 'frontend', 'dist');

if (fs.existsSync(frontendDirectory)) {
    app.use(express.static(frontendDirectory));
    app.get(/.*/, (req, res, next) => {
        if (req.path.startsWith('/api/') || req.path === '/health' || req.path.startsWith('/uploads/')) {
            return next();
        }

        return res.sendFile(path.join(frontendDirectory, 'index.html'));
    });
}

module.exports = app;
