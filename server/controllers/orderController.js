const { pool } = require('../config/db');

const createOrder = async (req, res) => {
  const { address } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get cart items
    const [items] = await conn.query(
      `SELECT c.quantity, p.id AS product_id, p.price, p.stock
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    if (!items.length) return res.status(400).json({ message: 'Cart is empty' });

    // Check stock
    for (const item of items) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ message: `Insufficient stock for product ${item.product_id}` });
      }
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Create order
    const [order] = await conn.query(
      'INSERT INTO orders (user_id, total, address) VALUES (?, ?, ?)',
      [req.user.id, total, address]
    );

    // Insert order items & decrement stock
    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [order.insertId, item.product_id, item.quantity, item.price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear cart
    await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    await conn.commit();

    res.status(201).json({ message: 'Order placed', orderId: order.insertId, total: total.toFixed(2) });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, GROUP_CONCAT(p.name SEPARATOR ', ') AS items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ?
       GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!orders[0]) return res.status(404).json({ message: 'Order not found' });

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image_url FROM order_items oi
       JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
