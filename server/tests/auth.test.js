const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

// Mock db.execute to avoid hitting real database
jest.mock('../src/config/db', () => ({
    execute: jest.fn(),
    testConnection: jest.fn().mockResolvedValue(true)
}));

describe('Auth Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            // Mock finding existing user (return empty array = no user found)
            db.execute.mockResolvedValueOnce([[]]);
            // Mock inserting new user
            db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
        });

        it('should return 400 if email already exists', async () => {
            // Mock finding existing user
            db.execute.mockResolvedValueOnce([[{ id: 1, email: 'test@example.com' }]]);

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });

        it('should validate input', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: '', // Invalid
                    email: 'invalid-email',
                    password: '123' // Too short
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/auth/login', () => {
        // We'll need to use the real bcrypt for hashing in the mock if we want to test password verification,
        // or we mock the User model. Since we are mocking db.execute, we return a hashed password.

        it('should login successfully with correct credentials', async () => {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('password123', 10);

            // Mock finding user
            db.execute.mockResolvedValueOnce([[{
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'user'
            }]]);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('token');
        });

        it('should return 400 for invalid password', async () => {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('password123', 10);

            // Mock finding user
            db.execute.mockResolvedValueOnce([[{
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword
            }]]);

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });
});
