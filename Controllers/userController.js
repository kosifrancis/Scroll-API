
const User = require('../Models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    try {
        const { username, age, email, password } = req.body || {};

        // Check that all required fields were provided
        if (
            !username ||
            age === undefined ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message: 'Please provide username, age, email, and password.'
            });
        }

        // Validate the username
        if (typeof username !== 'string' || !username.trim()) {
            return res.status(400).json({
                message: 'Username must be a non-empty string.'
            });
        }

        // Validate the age
        const userAge = Number(age);

        if (
            !Number.isInteger(userAge) ||
            userAge < 13 ||
            userAge > 120
        ) {
            return res.status(400).json({
                message: 'Age must be a whole number between 13 and 120.'
            });
        }

        // Validate the email format
        const normalizedEmail =
            typeof email === 'string' ? email.trim().toLowerCase() : '';

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                message: 'Please provide a valid email address.'
            });
        }

        // Validate the password
        if (
            typeof password !== 'string' ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters.'
            });
        }

        // Check whether the email is already registered
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'An account with this email already exists.'
            });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the new user in MongoDB
        const user = await User.create({
            username: username.trim(),
            age: userAge,
            email: normalizedEmail,
            password: hashedPassword
        });

        // Send back safe user information
        return res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: user._id,
                username: user.username,
                age: user.age,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        // Handle duplicate-email errors from MongoDB
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'An account with this email already exists.'
            });
        }

        // Handle unexpected errors
        console.error('Registration error:', error.message);

        return res.status(500).json({
            message: 'An unexpected error occurred during registration.'
        });
    }
};

module.exports = {
    registerUser
};
