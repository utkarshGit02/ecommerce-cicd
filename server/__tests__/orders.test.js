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

// Helper: builds a mock transaction connection (conn.query, beginTransaction, commit, rollback, release)
function mockConnection() {
  return {
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
  };
}

describe('Order routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/orders — placing an order', () => {
    it('creates an order, decrements stock, and clears the cart on success', async () => {
      const conn = mockConnection();
      pool.getConnection.mockResolvedValue(conn);

      conn.query
        .mockResolvedValueOnce([[                       // cart items fetch
          { quantity: 2, product_id: 10, price: 2499, stock: 50 },
        ]])
        .mockResolvedValueOnce([{ insertId: 101 }])      // insert order
        .mockResolvedValueOnce([{}])                     // insert order_items
        .mockResolvedValueOnce([{}])                     // decrement stock
        .mockResolvedValueOnce([{}]);                    // clear cart

      const res = await request(app).post('/api/orders').set(auth).send({ address: '123 Main St' });

      expect(res.statusCode).toBe(201);
      expect(res.body.orderId).toBe(101);
      expect(conn.commit).toHaveBeenCalled();
      expect(conn.rollback).not.toHaveBeenCalled();
    });

    it('rejects placing an order when the cart is empty', async () => {
      const conn = mockConnection();
      pool.getConnection.mockResolvedValue(conn);
      conn.query.mockResolvedValueOnce([[]]); // empty cart

      const res = await request(app).post('/api/orders').set(auth).send({ address: '123 Main St' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/cart is empty/i);
    });

    it('rolls back and rejects when stock is insufficient at order time', async () => {
      const conn = mockConnection();
      pool.getConnection.mockResolvedValue(conn);

      // Cart says quantity 5, but stock has dropped to 2 since adding to cart
      conn.query.mockResolvedValueOnce([[
        { quantity: 5, product_id: 10, price: 2499, stock: 2 },
      ]]);

      const res = await request(app).post('/api/orders').set(auth).send({ address: '123 Main St' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/insufficient stock/i);
      expect(conn.rollback).toHaveBeenCalled();
      expect(conn.commit).not.toHaveBeenCalled();
    });

    it('rolls back the entire transaction if any query fails mid-way', async () => {
      const conn = mockConnection();
      pool.getConnection.mockResolvedValue(conn);

      conn.query
        .mockResolvedValueOnce([[{ quantity: 1, product_id: 10, price: 2499, stock: 50 }]])
        .mockResolvedValueOnce([{ insertId: 102 }])
        .mockRejectedValueOnce(new Error('DB connection lost')); // fails inserting order_items

      const res = await request(app).post('/api/orders').set(auth).send({ address: '123 Main St' });

      expect(res.statusCode).toBe(500);
      expect(conn.rollback).toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();
    });

    it('releases the connection even when an error occurs', async () => {
      const conn = mockConnection();
      pool.getConnection.mockResolvedValue(conn);
      conn.query.mockRejectedValueOnce(new Error('unexpected failure'));

      await request(app).post('/api/orders').set(auth).send({ address: '123 Main St' });
      expect(conn.release).toHaveBeenCalled();
    });
  });

  describe('GET /api/orders/my', () => {
    it('returns the logged-in user\'s orders', async () => {
      pool.query.mockResolvedValueOnce([[
        { id: 1, total: 2499, status: 'pending', items: 'Headphones' },
      ]]);

      const res = await request(app).get('/api/orders/my').set(auth);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /api/orders (admin only)', () => {
    it('rejects non-admin users', async () => {
      const res = await request(app).get('/api/orders').set(auth);
      expect(res.statusCode).toBe(403);
    });

    it('allows admin users to see all orders', async () => {
      const adminToken = jwt.sign({ id: 2, email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET);
      pool.query.mockResolvedValueOnce([[
        { id: 1, customer_name: 'Test User', email: 'test@example.com', total: 2499 },
      ]]);

      const res = await request(app).get('/api/orders').set({ Authorization: `Bearer ${adminToken}` });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });
});
