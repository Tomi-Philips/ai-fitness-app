const supabase = require('../config/supabaseClient');

/**
 * Get user profile data
 */
const getProfile = async (req, res) => {
  const { id } = req.query; // Or from a decoded token in middleware later

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.status(200).json({ profile: data });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(404).json({ error: 'Profile not found' });
  }
};

/**
 * Update user profile data
 */
const updateProfile = async (req, res) => {
  const { id, age, gender, weight, height, activityLevel, goals } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        age: parseInt(age),
        gender,
        weight: parseFloat(weight),
        height: parseFloat(height),
        activity_level: activityLevel,
        fitness_goals: goals,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: data[0],
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
