const supabase = require('../config/supabaseClient');
const aiService = require('../services/aiService');

/**
 * AI Controller to handle workout recommendation requests.
 */
const getRecommendation = async (req, res) => {
  const userId = req.query.userId || req.user?.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // 1. Fetch User Profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw new Error('User profile not found: ' + userError.message);

    // 2. Fetch Today's Activity
    const today = new Date().toISOString().split('T')[0];
    const { data: activities, error: activityError } = await supabase
      .from('activities')
      .select('steps, calories')
      .eq('user_id', userId)
      .filter('logged_at', 'gte', today);

    if (activityError) console.warn('Activity fetch error:', activityError.message);

    // Sum up today's steps and calories
    const activityData = {
      steps: activities?.reduce((sum, a) => sum + (a.steps || 0), 0) || 0,
      calories: activities?.reduce((sum, a) => sum + (a.calories || 0), 0) || 0,
    };

    // 3. Get AI Recommendation (with Failover)
    const recommendation = await aiService.getRecommendation(user, activityData);

    res.status(200).json({
      recommendation,
      source: 'AI Coach',
    });
  } catch (error) {
    console.error('AI Recommendation Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getRecommendation,
};
