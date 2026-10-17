const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        age: user.age,
        email: user.email
    };
}

function createToken(user) {
    return jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== 'string' ||
            !emailPattern.test(email.trim()) ||
            typeof password !== 'string' ||
            !password
        ) {
            return res.status(400).json({
                message: 'Please provide a valid email and password.'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing from the environment.');
            return res.status(500).json({
                message: 'Authentication is not configured correctly.'
            });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        return res.status(200).json({
            message: 'Login successful!',
            token: createToken(user),
            user: publicUser(user)
        });
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({
            message: 'An unexpected error occurred during login.'
        });
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password, age } = req.body || {};
        const cleanUsername = typeof username === 'string' ? username.trim() : '';
        const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const parsedAge = Number(age);

        if (
            !cleanUsername ||
            cleanUsername.length > 30 ||
            !emailPattern.test(cleanEmail) ||
            typeof password !== 'string' ||
            password.length < 6 ||
            !Number.isInteger(parsedAge) ||
            parsedAge < 13 ||
            parsedAge > 120
        ) {
            return res.status(400).json({
                message: 'Enter a username (up to 30 characters), a valid email, a password of at least 6 characters, and an age between 13 and 120.'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing from the environment.');
            return res.status(500).json({
                message: 'Authentication is not configured correctly.'
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { username: cleanUsername },
                { email: cleanEmail }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'That username or email is already registered.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            username: cleanUsername,
            email: cleanEmail,
            password: hashedPassword,
            age: parsedAge
        });

        return res.status(201).json({
            message: 'Account created successfully!',
            token: createToken(user),
            user: publicUser(user)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'That username or email is already registered.'
            });
        }

        console.error('Registration error:', error.message);
        return res.status(500).json({
            message: 'Could not create your account.'
        });
    }
};

module.exports = {
    loginUser,
    registerUser
};