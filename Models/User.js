const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        age: {
            type: Number,
            required: true,
            min: 13,
            max: 120
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);    