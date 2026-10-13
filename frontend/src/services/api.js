const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');

const getHeaders = () => {
  const token = localStorage.getItem('aura_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateProfile: async (updates) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Habits
  getHabits: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/habits${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createHabit: async (habit) => {
    const res = await fetch(`${API_BASE_URL}/habits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(habit),
    });
    return handleResponse(res);
  },

  updateHabit: async (id, updates) => {
    const res = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  deleteHabit: async (id) => {
    const res = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  toggleHabit: async (id, date) => {
    const res = await fetch(`${API_BASE_URL}/habits/${id}/toggle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ date }),
    });
    return handleResponse(res);
  },

  getHabitHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/habits/history${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Tasks
  getTasks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/tasks${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createTask: async (task) => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task),
    });
    return handleResponse(res);
  },

  updateTask: async (id, updates) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  toggleTask: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Focus
  logFocusSession: async (sessionData) => {
    const res = await fetch(`${API_BASE_URL}/focus`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sessionData),
    });
    return handleResponse(res);
  },

  getFocusSessions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/focus${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getFocusStats: async () => {
    const res = await fetch(`${API_BASE_URL}/focus/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Notes
  getNotes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/notes${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createNote: async (note) => {
    const res = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(note),
    });
    return handleResponse(res);
  },

  updateNote: async (id, updates) => {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  deleteNote: async (id) => {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  togglePinNote: async (id) => {
    const res = await fetch(`${API_BASE_URL}/notes/${id}/pin`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Analytics
  getDashboardSummary: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAnalyticsInsights: async () => {
    const res = await fetch(`${API_BASE_URL}/analytics/insights`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Gamification & Goals
  getGoals: async () => {
    const res = await fetch(`${API_BASE_URL}/gamification/goals`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createGoal: async (goal) => {
    const res = await fetch(`${API_BASE_URL}/gamification/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(goal),
    });
    return handleResponse(res);
  },

  updateGoal: async (id, updates) => {
    const res = await fetch(`${API_BASE_URL}/gamification/goals/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  deleteGoal: async (id) => {
    const res = await fetch(`${API_BASE_URL}/gamification/goals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAchievements: async () => {
    const res = await fetch(`${API_BASE_URL}/gamification/achievements`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
