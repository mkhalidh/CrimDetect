/**
 * Authentication Service
 * Handles login, register, logout, and user state
 */

import api from './api';

const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'user';

const authService = {
    /**
     * Register a new user
     * @param {Object} userData - { name, email, password }
     * @returns {Promise<Object>} Response with user and token
     */
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        if (response.success && response.data.token) {
            this.setSession(response.data.token, response.data.user);
        }
        return response;
    },

    /**
     * Register a new admin
     * @param {Object} userData - { name, email, password }
     * @returns {Promise<Object>} Response with user and token
     */
    async registerAdmin(userData) {
        const response = await api.post('/auth/register-admin', userData);
        if (response.success && response.data.token) {
            this.setSession(response.data.token, response.data.user);
        }
        return response;
    },

    /**
     * Login user
     * @param {Object} credentials - { email, password }
     * @returns {Promise<Object>} Response with user and token
     */
    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        if (response.success && response.data.token) {
            this.setSession(response.data.token, response.data.user);
        }
        return response;
    },

    /**
     * Get current user
     * @returns {Promise<Object>} Current user data
     */
    async getCurrentUser() {
        const response = await api.get('/auth/me');
        if (response.success) {
            this.updateUser(response.data.user);
        }
        return response;
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        window.location.href = '/login';
    },

    /**
     * Set session data
     * @param {string} token - JWT token
     * @param {Object} user - User data
     */
    setSession(token, user) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    },

    /**
     * Update user data in storage
     * @param {Object} user - User data
     */
    updateUser(user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    },

    /**
     * Get stored token
     * @returns {string|null} JWT token
     */
    getToken() {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },

    /**
     * Get stored user
     * @returns {Object|null} User data
     */
    getUser() {
        const user = localStorage.getItem(AUTH_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} Is authenticated
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Check if user is admin
     * @returns {boolean} Is admin
     */
    isAdmin() {
        const user = this.getUser();
        return user?.role === 'admin';
    },

    /**
     * Update user profile
     * @param {Object} data - Profile data to update
     * @returns {Promise<Object>} Updated user data
     */
    async updateProfile(data) {
        const response = await api.put('/auth/profile', data);
        if (response.success) {
            this.updateUser(response.data.user);
        }
        return response;
    },

    /**
     * Change password
     * @param {Object} data - { currentPassword, newPassword }
     * @returns {Promise<Object>} Response
     */
    async changePassword(data) {
        return api.put('/auth/password', data);
    },
};

export default authService;
