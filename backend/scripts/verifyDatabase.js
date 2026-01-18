/**
 * Script to verify MongoDB database and show where data is stored
 * Usage: node scripts/verifyDatabase.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

async function verifyDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment-booking';
    
    console.log('🔍 Connecting to MongoDB...');
    console.log('📍 Connection String:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get database name from connection
    const dbName = mongoose.connection.db.databaseName;
    console.log('📊 Database Name:', dbName);
    console.log('📊 Database Name from URI:', mongoUri.split('/').pop() || 'default');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });
    
    // Count documents in each collection
    console.log('\n📈 Document Counts:');
    
    const userCount = await User.countDocuments();
    console.log(`   users: ${userCount} documents`);
    
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`   admin users: ${adminCount} documents`);
    
    const appointmentCount = await Appointment.countDocuments();
    console.log(`   appointments: ${appointmentCount} documents`);
    
    // Show admin users
    if (adminCount > 0) {
      console.log('\n👥 Admin Users:');
      const admins = await User.find({ role: 'admin' }).select('-password');
      admins.forEach((admin, index) => {
        console.log(`\n   Admin ${index + 1}:`);
        console.log(`      ID: ${admin._id}`);
        console.log(`      Name: ${admin.name}`);
        console.log(`      Email: ${admin.email}`);
        console.log(`      Phone: ${admin.phone || '❌ Missing'}`);
        console.log(`      Location: ${admin.location || '❌ Missing'}`);
      });
    }
    
    console.log('\n✅ Verification Complete!');
    console.log('\n📍 MongoDB Compass में देखने के लिए:');
    console.log(`   1. Database: "${dbName}"`);
    console.log('   2. Collection: "users" (admin users के लिए)');
    console.log('   3. Collection: "appointments" (appointments के लिए)');
    console.log('\n⚠️  Note: "admin" database में नहीं देखें - यह system database है!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
