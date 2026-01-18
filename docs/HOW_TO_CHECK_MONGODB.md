# MongoDB Compass में Admin Data कैसे Check करें

## ✅ सही Database और Collection:

1. **MongoDB Compass खोलें**
2. **Left Sidebar में देखें:**
   - `appointment-booking` database पर click करें
   - `users` collection पर click करें
   - यहाँ सभी users (admin + regular) दिखेंगे

## 📍 Data कहाँ है:

- **Database:** `appointment-booking` (NOT `admin`)
- **Collection:** `users`
- **Admin Users:** Role field में `"admin"` होगा

## 🔍 Admin User कैसे Identify करें:

1. `users` collection खोलें
2. Documents में देखें:
   - `role: "admin"` वाले users admin हैं
   - `phone` और `location` fields check करें
   - अगर missing हैं तो update करें

## ⚠️ Common Mistake:

- ❌ `admin` database में देख रहे हैं (यह empty है)
- ✅ `appointment-booking` database > `users` collection में देखें

## 🛠️ Script से Check करें:

```bash
cd backend
node scripts/checkAdmin.js
```

यह script सभी admin users और उनके details दिखाएगा।
