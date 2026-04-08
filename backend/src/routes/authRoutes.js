const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route   POST /auth/register
 * @desc    Register a new user and create an associated profile.
 */
router.post('/register', authController.register);

/**
 * @route   POST /auth/login
 * @desc    Login and retrieve user session and profile data.
 */
router.post('/login', authController.login);

module.exports = router;
