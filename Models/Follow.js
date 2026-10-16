
const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Prevent the same user from following someone twice.
followSchema.index(
    { follower: 1, following: 1 },
    { unique: true }
);

module.exports =
    mongoose.models.Follow ||
    mongoose.model('Follow', followSchema);
