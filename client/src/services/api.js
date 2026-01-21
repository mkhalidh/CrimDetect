/**
 * API Service
 * Axios instance with interceptors for authentication
 */

import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response;

            // Unauthorized - redirect to login
            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // Return error message from server
            return Promise.reject({
                status,
                message: data.message || 'An error occurred',
                errors: data.errors || [],
            });
        }

        // Network error
        if (error.request) {
            return Promise.reject({
                status: 0,
                message: 'Network error. Please check your connection.',
            });
        }

        return Promise.reject({
            status: 500,
            message: error.message || 'An unexpected error occurred',
        });
    }
);

export default api;
