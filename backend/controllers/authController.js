const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
  // Hardcoded secret - always use this to ensure it works
  const DEFAULT_SECRET = 'F@93kL!2xQp9#7sRzM1eA8BvC';
  
  // Try to get from env
  let secret = process.env.JWT_SECRET;
  
  // Validate secret - if not valid, use default
  if (!secret || 
      typeof secret !== 'string' ||
      secret.trim() === '' || 
      secret === 'your_super_secret_jwt_key_change_this_in_production' ||
      secret === 'undefined' ||
      secret.length < 10) {
    console.warn('⚠️ JWT_SECRET not valid, using default');
    secret = DEFAULT_SECRET;
  } else {
    secret = secret.trim();
  }
  
  // Final check - ensure we always have a valid secret
  if (!secret || secret.length === 0) {
    secret = DEFAULT_SECRET;
  }
  
  // Sign token with validated secret
  return jwt.sign({ userId }, secret, {
    expiresIn: '7d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate admin fields
    if (role === 'admin') {
      if (!phone || !location || phone.trim() === '' || location.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Admin must provide phone number and location. Both fields are required for admin registration.'
        });
      }
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      role: role || 'user' // Default to 'user' if not provided
    };

    // Add admin-specific fields if admin
    if (role === 'admin') {
      userData.phone = phone.trim();
      userData.location = location.trim();
    }

    let user;
    try {
      console.log('Creating user with data:', {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        location: userData.location
      });
      
      user = await User.create(userData);
      
      console.log('User created successfully:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location
      });
    } catch (createError) {
      console.error('User creation error:', {
        name: createError.name,
        message: createError.message,
        code: createError.code,
        errors: createError.errors
      });
      
      // Handle validation errors from pre-save hook
      if (createError.name === 'ValidationError' || 
          createError.message?.includes('phone') || 
          createError.message?.includes('location') ||
          createError.message?.includes('Admin must provide')) {
        return res.status(400).json({
          success: false,
          message: 'Admin must provide phone number and location. Both fields are required for admin registration.'
        });
      }
      
      // Handle duplicate email error
      if (createError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
      
      // Re-throw other errors
      throw createError;
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};
