const express = require('express');
const { getCart, addToCart, updateCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.get('/',           getCart);
router.post('/',          addToCart);
router.put('/:id',        updateCart);
router.delete('/clear',   clearCart);
router.delete('/:id',     removeFromCart);

module.exports = router;
