const { pool } = require('../config/db');

const getCart = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ items, total: total.toFixed(2) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  try {
    const [prod] = await pool.query('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (!prod[0]) return res.status(404).json({ message: 'Product not found' });
    if (prod[0].stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [req.user.id, product_id, quantity, quantity]
    );
    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCart = async (req, res) => {
  const { quantity } = req.body;
  try {
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      return res.json({ message: 'Item removed' });
    }
    await pool.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart, clearCart };
