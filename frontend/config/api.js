const API_BASE_URL = 'http://localhost:3000'; // Update this with your local IP for physical device testing

export default {
  BASE_URL: API_BASE_URL,
  endpoints: {
    health: `${API_BASE_URL}/health`,
    auth: {
      register: `${API_BASE_URL}/auth/register`,
      login: `${API_BASE_URL}/auth/login`,
    },
    user: {
      profile: `${API_BASE_URL}/user/profile`,
    },
    activity: {
      log: `${API_BASE_URL}/activity/log`,
      history: `${API_BASE_URL}/activity/history`,
    },
    workout: {
      recommendations: `${API_BASE_URL}/workout/recommendations`,
    },
  },
};
