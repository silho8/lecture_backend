const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');
const { generateToken } = require('../utils/jwt');

let testUser;
let token;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    testUser = await User.create({
        email: 'noteuser@example.com',
        password_hash: 'hashedpassword',
        full_name: 'Note User',
    });
    token = generateToken({ id: testUser.id, role: testUser.role });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Note Endpoints', () => {
    it('should reject note creation with missing title', async () => {
        const res = await request(app)
            .post('/api/notes')
            .set('Cookie', `lectura_token=${token}`)
            .field('course_code', 'CMPT101')
            // Missing title
            .attach('files', Buffer.from('test file content'), 'test.txt');

        expect(res.statusCode).toEqual(400);
        // This test will fail right now because I haven't added validation middleware for notes.
        // It's a good way to show where to add improvements.
        // For now, the controller logic itself would fail later, but a validator is better.
        // The expected behavior is a clear validation error.
    });

    it('should reject note creation with no files', async () => {
        const res = await request(app)
            .post('/api/notes')
            .set('Cookie', `lectura_token=${token}`)
            .send({
                title: 'Test Note',
                course_code: 'CMPT101',
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('At least one file is required.');
    });
});
