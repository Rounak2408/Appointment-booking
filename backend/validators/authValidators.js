const { body, validationResult } = require('express-validator');

/**
 * Validation middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  next();
};

/**
 * Register validation rules
 */
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('phone')
    .optional()
    .custom((value, { req }) => {
      if (req.body.role === 'admin') {
        if (!value || value.trim() === '') {
          throw new Error('Phone number is required for admin');
        }
        if (!/^[0-9]{10}$/.test(value.trim())) {
          throw new Error('Phone must be 10 digits');
        }
      }
      return true;
    }),
  body('location')
    .optional()
    .custom((value, { req }) => {
      if (req.body.role === 'admin') {
        if (!value || value.trim() === '') {
          throw new Error('Location is required for admin');
        }
        if (value.trim().length < 3) {
          throw new Error('Location must be at least 3 characters');
        }
      }
      return true;
    }),
  handleValidationErrors
];

/**
 * Login validation rules
 */
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Update profile validation rules
 */
exports.validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !/^[0-9]{10}$/.test(value)) {
        throw new Error('Phone must be 10 digits');
      }
      return true;
    }),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Location must be at least 3 characters'),
  handleValidationErrors
];

/**
 * Change password validation rules
 */
exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  handleValidationErrors
];
