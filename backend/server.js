const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load .env file explicitly from backend directory
const envPath = path.join(__dirname, '.env');
const fs = require('fs');

// Auto-create .env file if it doesn't exist
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating from env.example...');
  const envExamplePath = path.join(__dirname, 'env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
  } else {
    // Create .env file with default values
    const defaultEnv = `PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/appointment-booking

JWT_SECRET=F@93kL!2xQp9#7sRzM1eA8BvC

RAZORPAY_KEY_ID=rzp_test_dummy
RAZORPAY_KEY_SECRET=dummy_secret
`;
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ .env file created with default values!');
  }
}

// Load .env file
require('dotenv').config({ path: envPath });

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found at:', envPath);
}

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not set in .env file!');
  console.error('Current working directory:', process.cwd());
  console.error('Looking for .env at:', envPath);
  console.error('\nPlease create .env file in backend folder with:');
  console.error('JWT_SECRET=F@93kL!2xQp9#7sRzM1eA8BvC');
  console.error('\nOr run: copy env.example .env');
  process.exit(1);
}

console.log('✅ JWT_SECRET loaded successfully');

// Import routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Conditionally load payment routes only if Razorpay keys are configured
const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

if (hasRazorpayKeys) {
  const paymentRoutes = require('./routes/paymentRoutes');
  app.use('/api/payments', paymentRoutes);
  console.log('✅ Payment routes enabled (Razorpay configured)');
} else {
  // Payment routes disabled - return informative message
  app.use('/api/payments', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Payment features are disabled. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file to enable payments.',
      note: 'Appointment booking works without payment. You can enable payment later by adding Razorpay credentials.'
    });
  });
  console.log('⚠️  Payment routes disabled (Razorpay keys not configured)');
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-booking';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  const dbName = mongoose.connection.db.databaseName;
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${dbName}`);
  console.log(`📍 Connection: ${mongoUri}`);
  console.log('💡 MongoDB Compass में देखने के लिए:');
  console.log(`   Database: "${dbName}"`);
  console.log('   Collection: "users" (admin users के लिए)');
  console.log('   Collection: "appointments" (appointments के लिए)');
  console.log('⚠️  Note: "admin" database में नहीं देखें - यह system database है!\n');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;
