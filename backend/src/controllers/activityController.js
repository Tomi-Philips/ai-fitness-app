const supabase = require('../config/supabaseClient');

/**
 * Log a new activity session (steps, duration, etc).
 */
const logActivity = async (req, res) => {
  const { steps, duration, calories, activityType } = req.body;
  const userId = req.user?.id || req.body.userId; // Support both auth header or body for now

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([
        {
          user_id: userId,
          steps: parseInt(steps) || 0,
          duration: parseInt(duration) || 0,
          calories: parseFloat(calories) || 0,
          activity_type: activityType || 'walking',
          logged_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Activity logged successfully',
      activity: data[0],
    });
  } catch (error) {
    console.error('Log Activity Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get recent activity history for a user.
 */
const getActivityHistory = async (req, res) => {
  const userId = req.query.userId || req.user?.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.status(200).json({
      history: data,
    });
  } catch (error) {
    console.error('Fetch Activity Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get weekly stats (last 7 days grouped by day).
 */
const getWeeklyStats = async (req, res) => {
  const userId = req.query.userId || req.user?.id;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('activities')
      .select('steps, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', sevenDaysAgo.toISOString())
      .order('logged_at', { ascending: true });

    if (error) throw error;

    // Grouping logic: Aggregate steps by day (YYYY-MM-DD)
    const grouped = data.reduce((acc, current) => {
      const day = new Date(current.logged_at).toISOString().split('T')[0];
      if (!acc[day]) acc[day] = 0;
      acc[day] += (current.steps || 0);
      return acc;
    }, {});

    // Transform into an array format for the frontend
    const stats = Object.keys(grouped).map(day => ({
      day,
      label: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
      steps: grouped[day]
    }));

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Fetch Weekly Stats Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  logActivity,
  getActivityHistory,
  getWeeklyStats,
};
