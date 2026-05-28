import axios from 'axios';

const API_BASE = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

// SIM Cards
export const getAllSims = () => api.get('/sims');
export const getAvailableSims = () => api.get('/sims/available');
export const createSim = (data) => api.post('/sims', data);
export const deleteSim = (id) => api.delete(`/sims/${id}`);
export const updateSimStatus = (id, status) => api.put(`/sims/${id}/status?status=${status}`);

// Customers
export const getAllCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Activations
export const getAllActivations = () => api.get('/activations');
export const activateSim = (data) => api.post('/activations', data);
export const publicActivate = (data) => api.post('/activations/public', data);

// Plans
export const getPlansByNetwork = (network) => api.get(`/plans/${network}`);

export default api;
