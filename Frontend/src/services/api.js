import axios from 'axios';

// Safely get API URL with proper validation
const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();

  if (import.meta.env.PROD) {
    if (!apiUrl) {
      console.error('❌ CRITICAL: VITE_API_URL is not set in production environment');
      console.warn('⚠️ Falling back to /api proxy - ensure backend is configured correctly');
      return '/api';
    }
    return apiUrl;
  }

  // Development: prefer the Vite proxy for local backend traffic. Only use VITE_API_URL when it is explicitly set to a valid local or remote endpoint.
  if (!apiUrl) {
    return '/api';
  }

  if (apiUrl.startsWith('/') || /^https?:\/\//.test(apiUrl)) {
    console.warn('⚠️ Using VITE_API_URL in development:', apiUrl);
    return apiUrl;
  }

  console.warn('⚠️ Invalid VITE_API_URL in development. Falling back to /api proxy.');
  return '/api';
};

const BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let csrfToken = null;
export const fetchCsrfToken = async () => {
  try {
    const { data } = await api.get('/csrf-token');
    csrfToken = data.csrfToken;
  } catch (err) {
    console.error('Failed to grab CSRF token', err);
  }
};

api.interceptors.request.use((config) => {
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['CSRF-Token'] = csrfToken;
  }
  return config;
});

const refreshAuthToken = async () => {
  try {
    const response = await authAPI.refreshToken();
    return response?.data?.success === true;
  } catch (err) {
    return false;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await fetchCsrfToken();
        originalRequest.headers['CSRF-Token'] = csrfToken;
        return api(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retryAuth) {
      if (originalRequest.skipAuthRedirect) {
        return Promise.reject(error);
      }

      originalRequest._retryAuth = true;
      if (originalRequest.url?.includes('/auth/refresh')) {
        window.location.href = '/login';
        return Promise.reject(error);
      }

      const refreshed = await refreshAuthToken();
      if (refreshed) {
        return api(originalRequest);
      }

      if (window.location.pathname !== '/login' && window.location.pathname !== '/auth-required') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 429 && originalRequest && !originalRequest._retry429) {
      originalRequest._retry429 = true;
      const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 1;
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refreshToken: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me', { skipAuthRedirect: true }),
  updateMe: (data) => api.put('/auth/me', data),
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password, confirmPassword) =>
    api.put(`/auth/reset-password/${token}`, { password, confirmPassword }),
};

export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getOne: (id) => api.get(`/expenses/${id}`),
  getStats: (params) => api.get('/expenses/stats', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  saveAll: (data) => api.put('/tasks', data),
  addTask: (day, name, type) => api.post('/tasks/add', { day, name, type }),
  toggle: (day, taskId) => api.patch('/tasks/toggle', { day, taskId }),
  delete: (day, taskId) => api.delete(`/tasks/${day}/${taskId}`),
  resetAll: () => api.patch('/tasks/reset'),
};

export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  getUpcoming: (limit) => api.get('/events/upcoming', { params: { limit } }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  saveAll: (data) => api.put('/attendance', data),
  mark: (date, status, note) => api.patch('/attendance/mark', { date, status, note }),
  addHoliday: (date, name) => api.post('/attendance/holidays', { date, name }),
  removeHoliday: (date) => api.delete(`/attendance/holidays/${date}`),
  updateTimetable: (data) => api.put('/attendance/timetable', data),
};

export default api;
