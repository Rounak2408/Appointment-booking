# MongoDB Compass में Data कैसे देखें - Complete Guide

## ✅ Data MongoDB में है!

Verification script से पता चला:
- ✅ Database: `appointment-booking`
- ✅ Users: 4 documents
- ✅ Admin Users: 2 documents (phone और location के साथ)
- ✅ Appointments: 5 documents

## 🔍 MongoDB Compass में सही तरीके से देखें:

### **Step 1: सही Database खोलें**

1. **MongoDB Compass खोलें**
2. **Left Sidebar में देखें:**
   - `appointment-booking` database पर **CLICK** करें
   - ❌ `admin` database पर **नहीं** (यह system database है और empty है)

### **Step 2: Users Collection खोलें**

1. `appointment-booking` database expand करें
2. `users` collection पर **CLICK** करें
3. यहाँ सभी users (admin + regular) दिखेंगे

### **Step 3: Admin User Filter करें**

1. `users` collection में जाएं
2. Filter bar में type करें:
   ```json
   { "role": "admin" }
   ```
3. या Documents में manually देखें जहाँ `role: "admin"` है

## 📋 Expected Data:

### **Admin User 1:**
```json
{
  "_id": "696cb41c8013a847f4067716",
  "name": "rounak",
  "email": "rounakkeshri79@gmail.com",
  "role": "admin",
  "phone": "+919876543210",
  "location": "Delhi, India",
  "createdAt": "2026-01-18T10:21:16.000Z",
  "updatedAt": "2026-01-18T10:21:16.000Z"
}
```

### **Admin User 2:**
```json
{
  "_id": "696cb75d6edfd018c3dbfa84",
  "name": "prachi",
  "email": "lohaniprachi711@gmail.com",
  "role": "admin",
  "phone": "9155710347",
  "location": "patna Bihar",
  "createdAt": "2026-01-18T10:35:09.000Z",
  "updatedAt": "2026-01-18T10:35:09.000Z"
}
```

## ⚠️ Common Mistakes:

1. ❌ **Wrong Database:** `admin` database देख रहे हैं
   - ✅ **Correct:** `appointment-booking` database देखें

2. ❌ **Wrong Collection:** `appointments` collection देख रहे हैं
   - ✅ **Correct:** `users` collection देखें (admin users के लिए)

3. ❌ **Not Refreshed:** MongoDB Compass refresh नहीं किया
   - ✅ **Solution:** Refresh button click करें

## 🛠️ Verification Script:

Data verify करने के लिए:
```bash
cd backend
node scripts/verifyDatabase.js
```

यह script बताएगा:
- कौन सा database use हो रहा है
- कितने documents हैं
- Admin users की details

## 📍 Correct Path in MongoDB Compass:

```
MongoDB Compass
  └── appointment mangement (Connection)
      └── appointment-booking (Database) ← YAHAN CLICK KAREIN
          └── users (Collection) ← YAHAN CLICK KAREIN
              └── Documents (Yahan admin users hain)
```

## 🔄 अगर अभी भी Data नहीं दिख रहा:

1. **MongoDB Compass Refresh करें:**
   - Database list में right-click → "Refresh"
   - या Refresh button click करें

2. **Connection Verify करें:**
   - Connection string: `mongodb://localhost:27017/appointment-booking`
   - MongoDB server running है या नहीं check करें

3. **Script से Verify करें:**
   ```bash
   cd backend
   node scripts/verifyDatabase.js
   ```

## ✅ Summary:

- **Database:** `appointment-booking` (NOT `admin`)
- **Collection:** `users` (admin users के लिए)
- **Data है:** ✅ 2 admin users with phone and location
- **Script verify करें:** `node scripts/verifyDatabase.js`

**अब MongoDB Compass में `appointment-booking` database > `users` collection में जाकर देखें!**
