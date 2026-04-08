const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

/**
 * @route   GET /ai/recommendation
 * @desc    Get a personalized workout recommendation from the AI coach.
 * @access  Private (To be secured with middleware soon)
 */
router.get('/recommendation', aiController.getRecommendation);

module.exports = router;
