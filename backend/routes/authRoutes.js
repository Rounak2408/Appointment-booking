const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  getAllUsers,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} = require('../validators/authValidators');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', auth, getMe);

// Profile routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validateUpdateProfile, updateProfile);
router.put('/profile/password', auth, validateChangePassword, changePassword);

// Admin routes
router.get('/users', auth, admin, getAllUsers);

module.exports = router;
