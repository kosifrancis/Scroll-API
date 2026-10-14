
const express = require('express');

const homeRoutes = require('./routes/homeRoutes');
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./Routes/userRoutes');
const authRoutes = require('./Routes/authRoutes');
const profileRoutes = require('./Routes/profileRoutes');
const postRoutes = require('./Routes/postRoutes');
const likeRoutes = require('./Routes/likeRoutes');
const commentRoutes = require('./Routes/commentRoutes');
const followRoutes = require('./Routes/followRoutes');  

const app = express();

app.use(express.json());

app.use('/', homeRoutes);
app.use('/', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);     
app.use('/api/profile', profileRoutes);  
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api', commentRoutes);
app.use('/api/follows', followRoutes);

module.exports = app;
