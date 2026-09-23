import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from '@/constants/app';

const VENDOR_TOKEN_KEY = 'kw_vendor_token';

const vendorClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

vendorClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(VENDOR_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

vendorClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(VENDOR_TOKEN_KEY);
      window.location.href = '/vendor/login';
    }
    return Promise.reject(error);
  }
);

export default vendorClient;
