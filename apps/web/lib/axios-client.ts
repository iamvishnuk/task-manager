import axios from 'axios';
import { redirect } from 'next/navigation';

const options = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000
};

const API = axios.create(options);

export const APIRefresh = axios.create(options);
APIRefresh.interceptors.response.use((response) => response);

export const handleUnauthorized = () => {
  redirect('/login');
};

API.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (!error.response) {
      return Promise.reject({
        status: 'error',
        message: 'Network error occurred'
      });
    }

    const { data, status } = error.response;

    // Do not attempt to refresh token for auth routes (login, signup)
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/signup');

    if (status === 401 && !isAuthRoute) {
      try {
        const response = await APIRefresh.post('/auth/refresh');
        if (response.status === 200) {
          return API.request(error.config);
        }
      } catch (refreshError: any) {
        handleUnauthorized();
        const refreshData = refreshError.response?.data;
        return Promise.reject({
          status: 'error',
          message: refreshData?.message || 'Unauthorized access',
          statusCode: 401
        });
      }

      handleUnauthorized();
      return Promise.reject({
        status: 'error',
        message: 'Unauthorized access',
        statusCode: 401
      });
    }

    return Promise.reject({
      status: data?.status || 'error',
      message: data?.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' &&
        data?.stack && { stack: data.stack })
    });
  }
);

export default API;
