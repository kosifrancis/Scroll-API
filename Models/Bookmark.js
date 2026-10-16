
const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, { timestamps: true });

// Prevent saving the same post twice.
bookmarkSchema.index(
    { user: 1, post: 1 },
    { unique: true }
);

module.exports =
    mongoose.models.Bookmark ||
    mongoose.model('Bookmark', bookmarkSchema);
