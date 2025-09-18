const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

// Use an in-memory SQLite database for tests
beforeAll(async () => {
    await sequelize.sync({ force: true }); // This will create tables based on models
});

afterAll(async () => {
    await sequelize.close();
});

describe('Auth Endpoints', () => {
    it('should allow a user to sign up', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                email: 'test@example.com',
                password: 'password123',
                full_name: 'Test User',
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe('test@example.com');
        expect(res.body).toHaveProperty('token');
    });

    it('should not allow duplicate email signup', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('User with this email already exists.');
    });

    it('should allow a registered user to log in', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('user');
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword',
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Invalid credentials.');
    });
});
