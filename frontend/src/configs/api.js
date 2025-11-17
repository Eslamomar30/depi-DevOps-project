import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: '/api'
});

// Check if there's a token in the cookies and add it to the headers if it exists
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;