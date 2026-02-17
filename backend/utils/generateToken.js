const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * Utility function for token generation
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
  
  // Sign token with validated secret - 1 hour expiration
  return jwt.sign({ userId }, secret, {
    expiresIn: '1h'
  });
};

module.exports = generateToken;
