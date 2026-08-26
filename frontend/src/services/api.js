import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('esim_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or health endpoints
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/health')) {
        localStorage.removeItem('esim_token');
        localStorage.removeItem('esim_user');
      }
    }
    return Promise.reject(error);
  }
);

// --- 1. Auth APIs ---
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getCurrentUser = () => api.get('/auth/me');
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// --- 2. Device APIs ---
export const getMyDevices = () => api.get('/devices/my-devices');
export const registerDevice = (data) => api.post('/devices/register', data);
export const deleteDevice = (id) => api.delete(`/devices/${id}`);
export const validateEID = (eid) => api.post('/devices/validate-eid', { eid });

// --- 3. Plans APIs ---
export const getAllPlans = (params) => api.get('/plans', { params });
export const getPlanById = (id) => api.get(`/plans/${id}`);

// --- 4. OTP Verification APIs ---
export const sendOtp = (phone) => api.post('/otp/send', { phone });
export const verifyOtp = (phone, otpCode) => api.post('/otp/verify', { phone, otpCode });
export const resendOtp = (phone) => api.post('/otp/resend', { phone });

// --- 5. Payment APIs ---
export const calculateCheckout = (planId) => api.post('/payment/calculate', { planId });
export const processPayment = (data) => api.post('/payment/process', data);
export const getMyPayments = () => api.get('/payment/my-payments');

// --- 6. eSIM Provisioning APIs ---
export const createEsimRequest = (data) => api.post('/esim/request', data);
export const getMyEsimRequests = () => api.get('/esim/my-requests');
export const getEsimRequestById = (id) => api.get(`/esim/request/${id}`);
export const updateDemoStatus = (id, status, note) => api.post(`/esim/request/${id}/status`, { status, note });

// --- 7. Admin Management APIs ---
export const getAdminStats = () => api.get('/admin/stats');
export const getAllAdminRequests = (params) => api.get('/admin/requests', { params });
export const updateAdminRequestStatus = (id, data) => api.put(`/admin/requests/${id}/status`, data);
export const getAllAdminUsers = () => api.get('/admin/users');
export const getAllAdminDevices = () => api.get('/admin/devices');
export const getAllAdminPayments = () => api.get('/admin/payments');
export const getAdminAuditLogs = () => api.get('/admin/logs');

export default api;
