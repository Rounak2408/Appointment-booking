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
 * Create appointment validation rules
 */
exports.validateCreateAppointment = [
  body('serviceType')
    .trim()
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['Consultation', 'Checkup', 'Follow-up', 'Emergency'])
    .withMessage('Invalid service type'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        throw new Error('Date must be today or in the future');
      }
      return true;
    }),
  body('timeSlot')
    .trim()
    .notEmpty()
    .withMessage('Time slot is required'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  handleValidationErrors
];

/**
 * Update appointment status validation rules
 */
exports.validateUpdateStatus = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['booked', 'accepted', 'completed', 'cancelled'])
    .withMessage('Invalid status. Must be: booked, accepted, cancelled, or completed'),
  handleValidationErrors
];
