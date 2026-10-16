
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    content: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: ''
    },

    media: [{
        url: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ['image', 'video'],
            required: true
        }
    }]
}, {
    timestamps: true
});

module.exports =
    mongoose.models.Post ||
    mongoose.model('Post', postSchema);
