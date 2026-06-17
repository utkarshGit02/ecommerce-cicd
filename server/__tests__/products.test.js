const request = require('supertest');
const app     = require('../index');

jest.mock('../config/db', () => ({
  pool: { query: jest.fn(), getConnection: jest.fn() },
  connectDB: jest.fn(),
}));

const { pool } = require('../config/db');

describe('Product routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/products', () => {
    it('returns products list with pagination', async () => {
      pool.query
        .mockResolvedValueOnce([[
          { id: 1, name: 'Headphones', price: 2499, category_name: 'Electronics' },
        ]])
        .mockResolvedValueOnce([[{ total: 1 }]]);

      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a single product', async () => {
      pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Headphones', price: 2499 }]]);

      const res = await request(app).get('/api/products/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Headphones');
    });

    it('returns 404 if product not found', async () => {
      pool.query.mockResolvedValueOnce([[]]); // empty result

      const res = await request(app).get('/api/products/999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/products/categories', () => {
    it('returns all categories', async () => {
      pool.query.mockResolvedValueOnce([[
        { id: 1, name: 'Electronics', slug: 'electronics' },
      ]]);
      const res = await request(app).get('/api/products/categories');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
