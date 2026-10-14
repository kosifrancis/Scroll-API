
const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check that both fields were provided
        if (
            typeof email !== 'string' ||
            !email.trim() ||
            typeof password !== 'string' ||
            !password
        ) {
            return res.status(400).json({
                message: 'Please provide a valid email and password.'
            });
        }

        // Find the user by email
        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        // Use the same response for an unknown email or wrong password
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        // Compare the submitted password with the stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        // Confirm the JWT secret exists
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing from the environment.');

            return res.status(500).json({
                message: 'Authentication is not configured correctly.'
            });
        }

        // Create a signed token that expires in one hour
        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return the token and safe user information
        return res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                username: user.username,
                age: user.age,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            message: 'An unexpected error occurred during login.'
        });
    }
};

module.exports = {
    loginUser
};
