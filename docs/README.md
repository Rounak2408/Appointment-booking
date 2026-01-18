# Documentation

This folder contains additional documentation and guides for the Appointment Booking System.

## Available Guides

- **[MongoDB Compass Guide](./MONGODB_COMPASS_GUIDE.md)** - How to check data in MongoDB Compass
- **[MongoDB Compass Fix](./MONGODB_COMPASS_FIX.md)** - Troubleshooting MongoDB Compass issues
- **[How to Check MongoDB](./HOW_TO_CHECK_MONGODB.md)** - Quick guide to verify MongoDB data
- **[Update Admin Guide](./UPDATE_ADMIN_GUIDE.md)** - How to update admin user details

## Quick Links

### MongoDB Verification
```bash
cd backend
node scripts/verifyDatabase.js
```

### Check Admin Users
```bash
cd backend
node scripts/checkAdmin.js
```

### Update Admin User
```bash
cd backend
node scripts/updateAdmin.js <email> <phone> <location>
```

### Create Admin User
```bash
cd backend
node scripts/createAdmin.js
```
