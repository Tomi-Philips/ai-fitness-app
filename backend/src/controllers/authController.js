const supabase = require('../config/supabaseClient');

/**
 * Handle user registration
 */
const register = async (req, res) => {
  const { email, password, age, gender, weight, height, activityLevel, goals } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Create profile in our custom 'users' table
    // authData.user.id is the unique identifier
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          age: parseInt(age),
          gender,
          weight: parseFloat(weight),
          height: parseFloat(height),
          activity_level: activityLevel,
          fitness_goals: goals,
        },
      ])
      .select();

    if (profileError) throw profileError;

    res.status(201).json({
      message: 'User registered successfully',
      user: authData.user,
      profile: profileData[0],
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Handle user login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.status(200).json({
      message: 'Login successful',
      session: data.session,
      user: data.user,
      profile: profile || null,
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(401).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
};
