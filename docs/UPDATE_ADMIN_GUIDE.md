# Admin User Update करने का Guide

## 📝 Step-by-Step Instructions:

### **Method 1: PowerShell/Terminal से Update करें**

1. **Terminal/PowerShell खोलें**
   - Windows: `Win + X` → "Windows PowerShell" या "Terminal"
   - या VS Code में `Ctrl + ~` (Terminal खोलने के लिए)

2. **Project folder में जाएं:**
   ```powershell
   cd C:\Users\rounak\Desktop\Appointment
   ```

3. **Backend folder में जाएं:**
   ```powershell
   cd backend
   ```

4. **Update script run करें:**
   ```powershell
   node scripts/updateAdmin.js <email> <phone> <location>
   ```

### **Example Commands:**

#### **Example 1: rounak ke liye update**
```powershell
cd C:\Users\rounak\Desktop\Appointment\backend
node scripts/updateAdmin.js rounakkeshri79@gmail.com "+919876543210" "Delhi, India"
```

#### **Example 2: prachi ke liye update**
```powershell
cd C:\Users\rounak\Desktop\Appointment\backend
node scripts/updateAdmin.js lohaniprachi711@gmail.com "9155710347" "Patna, Bihar"
```

#### **Example 3: Apna phone/location change karna**
```powershell
cd C:\Users\rounak\Desktop\Appointment\backend
node scripts/updateAdmin.js YOUR_EMAIL "YOUR_PHONE" "YOUR_LOCATION"
```

### **Important Notes:**

1. **Email:** Admin user ka email address (exact match)
2. **Phone:** Phone number (quotes में)
3. **Location:** Location (quotes में, agar space hai to)

### **Agar Error Aaye:**

- **"Cannot find module"** → `cd backend` command run karein pehle
- **"User not found"** → Email address check karein
- **"MongoDB connection error"** → MongoDB server check karein

### **Quick Check:**

Update ke baad verify karne ke liye:
```powershell
node scripts/checkAdmin.js
```

---

## 🎯 Current Admin Users:

1. **rounak** - rounakkeshri79@gmail.com
2. **prachi** - lohaniprachi711@gmail.com

---

## 💡 Tips:

- Phone number me `+` sign use karein (agar international format chahiye)
- Location me commas use kar sakte hain
- Quotes (`"`) me wrap karein agar space hai
