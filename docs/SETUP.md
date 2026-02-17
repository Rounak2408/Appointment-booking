# 🚀 Setup Guide – Appointment Booking

Step-by-step guide project ko local machine par run karne ke liye.

---

## 1. Prerequisites

- **Node.js** v14 ya usse upar ([nodejs.org](https://nodejs.org))
- **MongoDB** – local install ya [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
- **Git** (optional) – code clone karne ke liye

Check karne ke liye:
```bash
node -v    # v14+
npm -v
```

---

## 2. Project Get Karna

Agar Git use kar rahe ho:
```bash
git clone <repository-url>
cd Appointment
```

Ya project folder ko direct open karo (e.g. `C:\Users\...\Desktop\Appointment`).

---

## 3. Backend Setup

### 3.1 Dependencies install

```bash
cd backend
npm install
```

### 3.2 Environment variables

1. `backend` folder mein `env.example` ko copy karke `.env` banao:
   - **Windows (PowerShell):** `Copy-Item env.example .env`
   - **Mac/Linux:** `cp env.example .env`

2. `.env` file open karke ye values set karo:

```env
PORT=5000
NODE_ENV=development

# MongoDB – local ya Atlas URI
MONGODB_URI=mongodb://localhost:27017/appointment-booking

# JWT – strong random string (min 10 characters)
JWT_SECRET=your_secret_key_here_min_10_chars

# Razorpay (optional – bina iske bhi booking chalegi)
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
```

- **Local MongoDB:** `MONGODB_URI=mongodb://localhost:27017/appointment-booking`
- **Atlas:** MongoDB Atlas dashboard se "Connect" → "Connect your application" → URI copy karo, password replace karo.

### 3.3 Backend run

```bash
npm start
```

Agar auto-restart chahiye (development):
```bash
npm run dev
```

Success par terminal mein aisa dikhega:
- `✅ MongoDB connected successfully`
- `✅ Server running on port 5000`

---

## 4. Frontend Setup

Naya terminal open karo (backend chalta rehne do).

### 4.1 Dependencies install

```bash
cd frontend
npm install
```

### 4.2 Environment variables

`frontend` folder mein `.env` file banao (agar nahi hai):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Production / different backend URL ke liye yahi change karna hoga.

### 4.3 Frontend run

```bash
npm start
```

Browser mein `http://localhost:3000` open hoga.

---

## 5. Admin User Banana

Pehli baar admin use karne ke liye ek admin user chahiye.

### Option A: Script se (recommended)

```bash
cd backend
node scripts/createAdmin.js
```

Script name, email, password, phone, location puchega. Uske hisaab se bhar do.

### Option B: Signup page se

1. Browser mein `http://localhost:3000/signup` open karo.
2. Name, Email, Password, **Role = Admin** choose karo.
3. **Phone** (10 digits) aur **Location** zaroor bharo – admin ke liye required hai.
4. Sign Up click karo.

Admin ab `/admin` par ja kar dashboard use kar sakta hai.

Agar admin ke phone/location baad mein add/change karne hain to: [UPDATE_ADMIN_GUIDE.md](./UPDATE_ADMIN_GUIDE.md)

---

## 6. Verify Setup

1. **Backend:** Browser ya Postman: `http://localhost:5000/api/health`  
   Response: `{ "success": true, "message": "Server is running" }`

2. **Frontend:** `http://localhost:3000` – Home page dikhna chahiye.

3. **Login:** Signup → Login → Dashboard/Profile open hona chahiye.

4. **MongoDB:** Data dekhne ke liye: [HOW_TO_CHECK_MONGODB.md](./HOW_TO_CHECK_MONGODB.md) ya [MONGODB_COMPASS_GUIDE.md](./MONGODB_COMPASS_GUIDE.md)

---

## 7. Common Issues

### Port already in use
- Backend: `.env` mein `PORT=5001` (ya koi free port) try karo.
- Frontend: `PORT=3001 npm start` (ya jo bhi port chahiye).

### MongoDB connection error
- MongoDB service start hai? (Local: Services / `mongod` process check karo.)
- Atlas: IP whitelist (0.0.0.0/0 for testing) aur correct username/password in URI.

### CORS / API not loading
- Backend `http://localhost:5000` par chal raha hai na?
- Frontend `.env` mein `REACT_APP_API_URL=http://localhost:5000/api` sahi hai na?
- `.env` change ke baad frontend restart karo (`npm start`).

### Login / 401 errors
- Token 1 hour ke baad expire hota hai – dubara login karo.
- `.env` mein `JWT_SECRET` set hai na? Backend restart karo after changing.

---

## 8. Next Steps

- **API detail:** [API.md](./API.md)
- **Project structure / flow:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Docs index:** [README.md](./README.md)
