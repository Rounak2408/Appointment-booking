/**
 * Script to check admin user details
 * Usage: node scripts/checkAdmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-booking';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    
    console.log(`📊 Found ${admins.length} admin user(s):\n`);
    
    if (admins.length === 0) {
      console.log('⚠️  No admin users found in database!');
      console.log('\n💡 To create an admin user:');
      console.log('   1. Use signup page and select "Admin" role');
      console.log('   2. Or run: node scripts/createAdmin.js');
    } else {
      admins.forEach((admin, index) => {
        console.log(`Admin ${index + 1}:`);
        console.log(`  ID: ${admin._id}`);
        console.log(`  Name: ${admin.name}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Role: ${admin.role}`);
        console.log(`  Phone: ${admin.phone || '❌ MISSING'}`);
        console.log(`  Location: ${admin.location || '❌ MISSING'}`);
        console.log(`  Created: ${admin.createdAt}`);
        
        if (!admin.phone || !admin.location) {
          console.log(`  ⚠️  This admin cannot accept appointments (missing phone/location)`);
        } else {
          console.log(`  ✅ This admin can accept appointments`);
        }
        console.log('');
      });
    }

    // Find all users
    const allUsers = await User.find();
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    console.log(`   - Admins: ${admins.length}`);
    console.log(`   - Regular users: ${allUsers.length - admins.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();
