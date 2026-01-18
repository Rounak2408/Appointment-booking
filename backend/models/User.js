const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Stores user information including authentication details
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Admin specific fields
  phone: {
    type: String,
    trim: true,
    default: null
  },
  location: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

/**
 * Hash password before saving to database
 * This must run BEFORE validation to ensure password is hashed
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/**
 * Validation: Admin must have phone and location
 * Note: This validation is also done in the controller, but kept here as a safety check
 * This runs AFTER password hashing
 */
userSchema.pre('save', async function(next) {
  // Only validate for new admin users
  if (this.role === 'admin' && this.isNew) {
    // Check if phone and location are provided and not empty
    const phoneValue = this.phone ? this.phone.toString().trim() : '';
    const locationValue = this.location ? this.location.toString().trim() : '';
    
    if (!phoneValue || !locationValue) {
      const error = new Error('Admin must provide phone number and location');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

/**
 * Compare password method for login
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
