import apiConfig from '../config/api';

/**
 * Generic fetch wrapper for API calls
 */
async function apiFetch(endpoint: string, options: any = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${apiConfig.BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  try {
    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error: any) {
    console.error(`API Error (${method} ${url}):`, error.message);
    throw error;
  }
}

export const authService = {
  login: (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: credentials }),
  register: (userData: any) => apiFetch('/auth/register', { method: 'POST', body: userData }),
};

export const userService = {
  getProfile: (userId: string) => apiFetch(`/user/profile?id=${userId}`),
  updateProfile: (profileData: any) => apiFetch('/user/profile', { method: 'PUT', body: profileData }),
};

export const activityService = {
  logActivity: (activityData: any) => apiFetch('/activity/log', { method: 'POST', body: activityData }),
  getActivityHistory: (userId: string) => apiFetch(`/activity/history?userId=${userId}`),
  getWeeklyStats: (userId: string) => apiFetch(`/activity/stats/weekly?userId=${userId}`),
};

export const aiService = {
  getRecommendation: (userId: string) => apiFetch(`/ai/recommendation?userId=${userId}`),
};

export default apiFetch;
