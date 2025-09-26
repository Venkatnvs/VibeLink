import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8000";

const AXIOS_INSTANCE = axios.create({
  baseURL: BASE_URL,
});

AXIOS_INSTANCE.interceptors.request.use(
  config => {
    // Get token from localStorage for now (we'll update this to use cookies later)
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

AXIOS_INSTANCE.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response) {
      if (
        error.response.status === 401 &&
        originalRequest.url === '/api/auth/token/refresh/'
      ) {
        console.error('Token refresh failed');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Dispatch custom event to trigger logout in the app
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await AXIOS_INSTANCE.post(
              '/api/auth/token/refresh/',
              {
                refresh: refreshToken,
              },
            );
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            AXIOS_INSTANCE.defaults.headers.common[
              'Authorization'
            ] = `Bearer ${response.data.access}`;
            originalRequest.headers[
              'Authorization'
            ] = `Bearer ${response.data.access}`;
            return AXIOS_INSTANCE(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Dispatch custom event to trigger logout in the app
            window.dispatchEvent(new CustomEvent('auth:logout'));
            return Promise.reject(error);
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

export default AXIOS_INSTANCE;
