const mongoose = require('mongoose');

/**
 * Appointment Schema
 * Stores appointment booking information
 */
const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        // Date should not be in the past
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['booked', 'accepted', 'cancelled', 'completed'],
    default: 'booked'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  // Admin acceptance details
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminName: {
    type: String,
    default: null,
    trim: true
  },
  adminPhone: {
    type: String,
    default: null,
    trim: true
  },
  adminLocation: {
    type: String,
    default: null,
    trim: true
  },
  acceptedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

/**
 * Index to prevent double booking for same date and timeSlot
 */
appointmentSchema.index({ date: 1, timeSlot: 1 }, { 
  unique: true,
  partialFilterExpression: { status: { $ne: 'cancelled' } }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
