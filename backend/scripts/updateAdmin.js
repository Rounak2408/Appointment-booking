/**
 * Script to update existing admin user with phone and location
 * Usage: node scripts/updateAdmin.js <email> <phone> <location>
 * Example: node scripts/updateAdmin.js admin@example.com +1234567890 "New York, USA"
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

// Get arguments from command line
const args = process.argv.slice(2);
const email = args[0];
const phone = args[1];
const location = args[2];

async function updateAdmin() {
  try {
    if (!email || !phone || !location) {
      console.log('❌ Usage: node scripts/updateAdmin.js <email> <phone> <location>');
      console.log('Example: node scripts/updateAdmin.js admin@example.com +1234567890 "New York, USA"');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-booking';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log('📋 Current User Details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Phone: ${user.phone || '❌ Missing'}`);
    console.log(`   Location: ${user.location || '❌ Missing'}\n`);

    // Update phone and location
    user.phone = phone.trim();
    user.location = location.trim();
    
    // If not admin, make them admin
    if (user.role !== 'admin') {
      console.log('⚠️  User is not admin. Updating role to admin...');
      user.role = 'admin';
    }

    await user.save();

    console.log('✅ Admin user updated successfully!\n');
    console.log('📋 Updated Details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Location: ${user.location}\n`);
    console.log('✅ Now you can accept appointments!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin:', error.message);
    process.exit(1);
  }
}

updateAdmin();
