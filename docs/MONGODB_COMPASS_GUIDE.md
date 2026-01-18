# MongoDB Compass में Data कैसे Check करें

## ✅ Data MongoDB में है!

Script output से पता चल रहा है कि data MongoDB में save हो रहा है:
- ✅ 2 Admin users found
- ✅ Phone और Location details present हैं

## 🔍 MongoDB Compass में Check करने का सही तरीका:

### **Step 1: सही Database खोलें**

1. **MongoDB Compass खोलें**
2. **Left Sidebar में देखें:**
   - `appointment-booking` database पर **click** करें
   - ❌ `admin` database पर नहीं (यह empty है)
   - ❌ `config` database पर नहीं
   - ❌ `local` database पर नहीं

### **Step 2: Users Collection खोलें**

1. `appointment-booking` database expand करें
2. `users` collection पर **click** करें
3. यहाँ सभी users (admin + regular) दिखेंगे

### **Step 3: Admin User Identify करें**

Documents में देखें:
- `role: "admin"` वाले users admin हैं
- `phone` और `location` fields check करें
- `_id`, `name`, `email` भी दिखेंगे

## 📋 Expected Data:

### **Admin User 1:**
```json
{
  "_id": "696cb41c8013a847f4067716",
  "name": "rounak",
  "email": "rounakkeshri79@gmail.com",
  "role": "admin",
  "phone": "+919876543210",
  "location": "Delhi, India"
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
  "location": "patna Bihar"
}
```

## 🔄 अगर Data नहीं दिख रहा:

### **Solution 1: Refresh करें**
- MongoDB Compass में **Refresh** button click करें
- या database को close करके फिर से open करें

### **Solution 2: Connection Check करें**
- MongoDB server running है या नहीं check करें
- Connection string verify करें: `mongodb://localhost:27017/appointment-booking`

### **Solution 3: Script से Verify करें**
```bash
cd backend
node scripts/checkAdmin.js
```

यह script MongoDB से directly data fetch करके दिखाएगा।

## ⚠️ Common Mistakes:

1. ❌ **Wrong Database:** `admin` database देख रहे हैं (यह empty है)
2. ❌ **Wrong Collection:** `appointments` collection देख रहे हैं (users collection देखें)
3. ❌ **Not Refreshed:** MongoDB Compass refresh नहीं किया

## ✅ Correct Path:

```
MongoDB Compass
  └── appointment-booking (Database)
      └── users (Collection)
          └── Documents (यहाँ admin users हैं)
```

## 🛠️ Quick Test:

Terminal में run करें:
```bash
cd backend
node scripts/checkAdmin.js
```

अगर script में data दिख रहा है, तो MongoDB में भी data है - बस सही database/collection check करें!
