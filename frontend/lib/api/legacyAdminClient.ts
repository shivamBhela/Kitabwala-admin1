import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from '@/constants/app';

const LEGACY_ADMIN_TOKEN_KEY = 'kw_legacy_admin_token';

const legacyAdminClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

legacyAdminClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(LEGACY_ADMIN_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

legacyAdminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY);
      // Let the UI handle the missing token rather than hard redirecting to /,
      // since this token is used alongside the portal token.
    }
    return Promise.reject(error);
  }
);

export default legacyAdminClient;
