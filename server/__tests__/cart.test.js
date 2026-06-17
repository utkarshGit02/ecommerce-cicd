const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../index');

jest.mock('../config/db', () => ({
  pool: { query: jest.fn(), getConnection: jest.fn() },
  connectDB: jest.fn(),
}));

const { pool } = require('../config/db');

process.env.JWT_SECRET = 'test_secret_for_ci_only';
const token = jwt.sign({ id: 1, email: 'test@example.com', role: 'customer' }, process.env.JWT_SECRET);
const auth  = { Authorization: `Bearer ${token}` };

describe('Cart routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/cart', () => {
    it('returns cart items with calculated total', async () => {
      pool.query.mockResolvedValueOnce([[
        { id: 1, quantity: 2, product_id: 10, name: 'Headphones', price: 2499, image_url: 'x.jpg', stock: 50 },
      ]]);

      const res = await request(app).get('/api/cart').set(auth);
      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.total).toBe('4998.00');
    });

    it('returns empty cart with zero total when no items', async () => {
      pool.query.mockResolvedValueOnce([[]]);
      const res = await request(app).get('/api/cart').set(auth);
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe('0.00');
    });

    it('rejects requests with no auth token', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/cart', () => {
    it('adds item to cart when stock is sufficient', async () => {
      pool.query
        .mockResolvedValueOnce([[{ stock: 10 }]])   // stock check
        .mockResolvedValueOnce([{}]);                // insert

      const res = await request(app).post('/api/cart').set(auth).send({ product_id: 10, quantity: 2 });
      expect(res.statusCode).toBe(201);
    });

    it('rejects when requested quantity exceeds stock', async () => {
      pool.query.mockResolvedValueOnce([[{ stock: 1 }]]);

      const res = await request(app).post('/api/cart').set(auth).send({ product_id: 10, quantity: 5 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/insufficient stock/i);
    });

    it('returns 404 when product does not exist', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app).post('/api/cart').set(auth).send({ product_id: 999, quantity: 1 });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/cart/:id', () => {
    it('updates quantity when positive', async () => {
      pool.query.mockResolvedValueOnce([{}]);
      const res = await request(app).put('/api/cart/1').set(auth).send({ quantity: 3 });
      expect(res.statusCode).toBe(200);
    });

    it('removes item when quantity is zero or less', async () => {
      pool.query.mockResolvedValueOnce([{}]);
      const res = await request(app).put('/api/cart/1').set(auth).send({ quantity: 0 });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/removed/i);
    });
  });
});
