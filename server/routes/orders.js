const express = require('express');
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.post('/',          createOrder);
router.get('/my',         getMyOrders);
router.get('/:id',        getOrder);
router.get('/',           adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
