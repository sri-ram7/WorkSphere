import axios from 'axios';

// -------------------------------
// Base URL Resolver
// -------------------------------
const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();

  if (import.meta.env.PROD) {
    if (!apiUrl) {
      console.error('❌ CRITICAL: VITE_API_URL is not set in production environment');
      return '/api';
    }
    return apiUrl;
  }

  if (!apiUrl) return '/api';

  if (apiUrl.startsWith('/') || /^https?:\/\//.test(apiUrl)) {
    return apiUrl;
  }

  return '/api';
};

const BASE_URL = getBaseURL();

// -------------------------------
// Axios Instance
// -------------------------------

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-Token',
});

// -------------------------------
// CSRF Token Fetch
// -------------------------------
export const fetchCsrfToken = async () => {
  try {
    await api.get('/csrf-token');
    console.log('✅ CSRF token fetched');
  } catch (err) {
    console.error('❌ Failed to grab CSRF token', err);
  }
};

// -------------------------------
// Refresh Token Logic
// -------------------------------
const refreshAuthToken = async () => {
  try {
    const response = await authAPI.refreshToken();
    return response?.data?.success === true;
  } catch {
    return false;
  }
};

// -------------------------------
// Response Interceptor
// -------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry CSRF failures once
    if (error.response?.status === 403 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await fetchCsrfToken();
        return api(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    // Handle auth refresh
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

      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/auth-required'
      ) {
        window.location.href = '/login';
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429 && originalRequest && !originalRequest._retry429) {
      originalRequest._retry429 = true;
      const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 1;
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// -------------------------------
// Auth API
// -------------------------------
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

// -------------------------------
// Expenses API
// -------------------------------
export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getOne: (id) => api.get(`/expenses/${id}`),
  getStats: (params) => api.get('/expenses/stats', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// -------------------------------
// Tasks API
// -------------------------------
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  saveAll: (data) => api.put('/tasks', data),
  addTask: (day, name, type) => api.post('/tasks/add', { day, name, type }),
  toggle: (day, taskId) => api.patch('/tasks/toggle', { day, taskId }),
  delete: (day, taskId) => api.delete(`/tasks/${day}/${taskId}`),
  resetAll: () => api.patch('/tasks/reset'),
};

// -------------------------------
// Events API
// -------------------------------
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  getUpcoming: (limit) => api.get('/events/upcoming', { params: { limit } }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// -------------------------------
// Attendance API
// -------------------------------
export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  saveAll: (data) => api.put('/attendance', data),
  mark: (date, status, note) => api.patch('/attendance/mark', { date, status, note }),
  addHoliday: (date, name) => api.post('/attendance/holidays', { date, name }),
  removeHoliday: (date) => api.delete(`/attendance/holidays/${date}`),
  updateTimetable: (data) => api.put('/attendance/timetable', data),
};

export default api;
