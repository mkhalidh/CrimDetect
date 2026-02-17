const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

// Mock middlewares to bypass auth for these tests
jest.mock('../src/middlewares/authMiddleware', () => ({
    authMiddleware: (req, res, next) => {
        req.user = { id: 1, role: 'admin' };
        next();
    }
}));

jest.mock('../src/middlewares/roleMiddleware', () => ({
    isAdmin: (req, res, next) => next()
}));

// Mock db
jest.mock('../src/config/db', () => ({
    execute: jest.fn(),
    query: jest.fn()
}));

// Mock multer to bypass file upload
jest.mock('../src/config/multer', () => ({
    upload: {
        single: () => (req, res, next) => {
            req.file = { filename: 'test-image.jpg', path: 'uploads/test-image.jpg' };
            next();
        }
    }
}));

// Mock face-api (FaceMatcher) because addCriminal uses it
jest.mock('../src/utils/faceMatcher', () => ({
    getFaceDescriptor: jest.fn().mockResolvedValue(new Float32Array(128).fill(0.1))
}));

describe('Admin Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/admin/criminals', () => {
        it('should return a list of criminals', async () => {
            // Mock count query
            db.execute.mockResolvedValueOnce([[{ count: 1 }]]);
            // Mock select query
            db.execute.mockResolvedValueOnce([[{
                id: 1,
                person_name: 'John Doe',
                crime_type: 'Theft',
                risk_level: 'LOW'
            }]]);

            const res = await request(app).get('/api/admin/criminals');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].person_name).toBe('John Doe');
        });
    });

    describe('POST /api/admin/criminal', () => {
        it('should add a criminal record', async () => {
            // Mock insert person
            db.execute.mockResolvedValueOnce([{ insertId: 10 }]);
            // Mock insert criminal record
            db.execute.mockResolvedValueOnce([{ insertId: 20 }]);

            const res = await request(app)
                .post('/api/admin/criminal')
                .field('name', 'Bad Guy')
                .field('crime_type', 'Robbery')
                .field('risk_level', 'HIGH')
                .attach('image', Buffer.from('fakeimage'), 'test.jpg');

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('Criminal record added');
        });
    });
});
