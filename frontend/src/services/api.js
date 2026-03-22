import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// ── Response interceptor for global error normalization ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log for debugging (non-sensitive)
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

// Employee APIs
export const employeeAPI = {
  getAll: () => api.get('/employees/'),
  getById: (employeeId) => api.get(`/employees/${employeeId}/`),
  create: (employeeData) => api.post('/employees/', employeeData),
  delete: (employeeId) => api.delete(`/employees/${employeeId}/`),
};

// Attendance APIs
export const attendanceAPI = {
  mark: (attendanceData) => api.post('/attendance/', attendanceData),
  getByEmployee: (employeeId) => api.get(`/attendance/employee/${employeeId}/`),
  getByDate: (date) => api.get(`/attendance/date/${date}/`),
};

export default api;