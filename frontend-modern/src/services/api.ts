import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    // Reject with a formatted error
    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data
    });
  }
);

export default api;
