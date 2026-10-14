
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Require a Bearer token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication required. Please log in.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token and its signature
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Make the authenticated user's ID available to routes
        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired authentication token.'
        });
    }
};

module.exports = {
    protect
};
