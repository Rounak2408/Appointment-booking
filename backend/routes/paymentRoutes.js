const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// All payment routes require authentication
router.post('/create-order', auth, createOrder);
router.post('/verify', auth, verifyPayment);

module.exports = router;
