const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

/**
 * @route   POST /activity/log
 * @desc    Log a new activity session (steps, duration, etc).
 */
router.post('/log', activityController.logActivity);

/**
 * @route   GET /activity/history
 * @desc    Get recent activity history for a user.
 */
router.get('/history', activityController.getActivityHistory);

/**
 * @route   GET /activity/stats/weekly
 * @desc    Get aggregated step data for the last 7 days.
 */
router.get('/stats/weekly', activityController.getWeeklyStats);

module.exports = router;
