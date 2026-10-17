const express = require('express');

const { registerUser } = require('../Controllers/authController');

const router = express.Router();

router.post('/register', registerUser);

module.exports = router;
