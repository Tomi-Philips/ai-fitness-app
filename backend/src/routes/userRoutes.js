const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @route   GET /user/profile
 * @desc    Get user profile by ID.
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /user/profile
 * @desc    Update user profile by ID.
 */
router.put('/profile', userController.updateProfile);

module.exports = router;
