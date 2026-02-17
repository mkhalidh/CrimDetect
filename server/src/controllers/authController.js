/**
 * Authentication Controller
 * Handles user registration, login, and profile retrieval
 */

const User = require('../models/User');
const Person = require('../models/Person');
const { generateToken } = require('../config/jwt');
const response = require('../utils/response');
const { validationResult } = require('express-validator');

const authController = {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    async register(req, res, next) {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response.validationError(res, errors.array());
            }

            const { name, email, password, role = 'user', age, cnic } = req.body;

            // Check if email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return response.error(res, 'Email already registered', 409);
            }

            // Create user
            const user = await User.create({ name, email, password, role });

            if (cnic) {
                const existingPerson = await Person.findByCnic(cnic);
                if (existingPerson) {
                    return response.error(res, 'CNIC already registered', 409);
                }
            }

            // Create associated person record
            await Person.create({
                user_id: user.id,
                name: user.name,
                age: age || null,
                cnic: cnic || null,
                status: 'NORMAL'
            });

            // Generate JWT token
            const token = generateToken(user);

            return response.created(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }, 'Registration successful');
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/auth/register-admin
     * Register a new admin user
     */
    async registerAdmin(req, res, next) {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response.validationError(res, errors.array());
            }

            const { name, email, password } = req.body;

            // Check if email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return response.error(res, 'Email already registered', 409);
            }

            // Create user with ADMIN role
            const user = await User.create({ name, email, password, role: 'admin' });

            // Create associated person record
            await Person.create({
                user_id: user.id,
                name: user.name,
                status: 'NORMAL'
            });

            // Generate JWT token
            const token = generateToken(user);

            return response.created(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }, 'Admin registration successful');
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/auth/login
     * Authenticate user and return JWT token
     */
    async login(req, res, next) {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response.validationError(res, errors.array());
            }

            const { email, password } = req.body;

            // Find user by email
            const user = await User.findByEmail(email);
            if (!user) {
                return response.unauthorized(res, 'Invalid email or password');
            }

            // Verify password
            const isValidPassword = await User.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return response.unauthorized(res, 'Invalid email or password');
            }

            // Generate JWT token
            const token = generateToken(user);

            return response.success(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }, 'Login successful');
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/auth/me
     * Get current authenticated user
     */
    async me(req, res, next) {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return response.notFound(res, 'User not found');
            }

            // Get associated person data
            const person = await Person.findByUserId(user.id);

            return response.success(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at
                },
                person: person ? {
                    id: person.id,
                    status: person.status,
                    cnic: person.cnic,
                    age: person.age
                } : null
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/auth/profile
     * Update user profile
     */
    async updateProfile(req, res, next) {
        try {
            const { name, email } = req.body;
            const userId = req.user.id;

            // Check if email is taken by another user
            if (email && email !== req.user.email) {
                const existingUser = await User.findByEmail(email);
                if (existingUser) {
                    return response.error(res, 'Email already in use', 409);
                }
            }

            // Update user
            const updated = await User.update(userId, { name, email });

            if (!updated) {
                return response.error(res, 'Failed to update profile');
            }

            const user = await User.findById(userId);

            return response.success(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }, 'Profile updated successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/auth/password
     * Change user password
     */
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            // Get user with password
            const user = await User.findByEmail(req.user.email);

            // Verify current password
            const isValid = await User.verifyPassword(currentPassword, user.password);
            if (!isValid) {
                return response.error(res, 'Current password is incorrect', 400);
            }

            // Update password
            await User.update(userId, { password: newPassword });

            return response.success(res, null, 'Password changed successfully');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
