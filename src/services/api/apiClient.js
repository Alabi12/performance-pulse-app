// src/services/api/apiClient.js
import axios from 'axios';
import { Store } from '../../store';
import { logout } from '../../store/slices/authSlice';

const API_BASE_URL = 'https://your-api-base-url.com/api'; // Use react-native-config for this

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the auth token
apiClient.interceptors.request.use(
  (config) => {
    const state = Store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, log the user out
      Store.dispatch(logout());
      // You might also navigate the user to the Login screen here
    }
    return Promise.reject(error);
  }
);

export default apiClient;