/**
 * Script to create an admin user
 * Usage: node scripts/createAdmin.js
 * 
 * This script creates an admin user in the database.
 * You can modify the credentials below.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

// Admin credentials - Change these as needed
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';
const ADMIN_PHONE = '+1234567890';
const ADMIN_LOCATION = 'New York, USA';

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-booking';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('ℹ️  Admin user already exists with this email');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Role: ${existingAdmin.role}`);
        process.exit(0);
      } else {
        // Update existing user to admin
        existingAdmin.role = 'admin';
        existingAdmin.phone = ADMIN_PHONE;
        existingAdmin.location = ADMIN_LOCATION;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log(`   Phone: ${ADMIN_PHONE}`);
        console.log(`   Location: ${ADMIN_LOCATION}`);
        process.exit(0);
      }
    }

    // Create new admin user
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      phone: ADMIN_PHONE,
      location: ADMIN_LOCATION
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`   Name: ${ADMIN_NAME}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Phone: ${ADMIN_PHONE}`);
    console.log(`   Location: ${ADMIN_LOCATION}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();
