
const express = require('express');
const router = express.Router();

const { search } = require('../Controllers/searchController');

router.get('/', search);

module.exports = router;
