const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers } = require('../controllers/authController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getMe);

// Admin routes
router.get('/users', auth, admin, getAllUsers);

module.exports = router;
