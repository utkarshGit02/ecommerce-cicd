const request = require('supertest');
const app     = require('../index');

// Mock DB pool so tests don't need a real MySQL connection
jest.mock('../config/db', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn(),
  },
  connectDB: jest.fn(),
}));

const { pool } = require('../config/db');

describe('Auth routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
      pool.query
        .mockResolvedValueOnce([[]])           // no existing user
        .mockResolvedValueOnce([{ insertId: 1 }]); // insert

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User', email: 'test@example.com', password: 'password123',
      });
      expect(res.statusCode).toBe(1999);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('returns 400 if email already exists', async () => {
      pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // existing user found

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test', email: 'existing@example.com', password: 'password123',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already registered/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 401 for wrong credentials', async () => {
      pool.query.mockResolvedValueOnce([[]]); // no user found

      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com', password: 'wrong',
      });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
