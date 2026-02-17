# 📅 Appointment Booking System

MERN stack appointment booking app – auth, user/admin dashboard, Razorpay payment, form validation.

---

## 📚 Documentation

Setup, API reference, architecture – sab **`docs/`** folder mein:

→ **[docs/README.md](docs/README.md)** – index | **[docs/SETUP.md](docs/SETUP.md)** – run karne ka steps | **[docs/API.md](docs/API.md)** – API detail

---

## ✨ Features

- JWT auth, protected routes, Profile page, change password  
- Appointment book / cancel, search & filter (status, date)  
- User dashboard (stats, upcoming), Admin dashboard (all appointments, users, accept)  
- Razorpay payment (optional), form validation (react-hook-form + yup), toast notifications  
- Mobile responsive, dark theme  

---

## 🛠️ Tech Stack

**Backend:** Node, Express, MongoDB, Mongoose, JWT, bcryptjs, express-validator, Razorpay  
**Frontend:** React 18, React Router, React Hook Form, Yup, Axios, Context API, React Toastify  

---

## 🚀 Quick Start

**Prerequisites:** Node.js v14+, MongoDB (local ya Atlas)

**Backend:**
```bash
cd backend
npm install
cp env.example .env
# .env mein: MONGODB_URI, JWT_SECRET (Razorpay optional)
npm start
```

**Frontend:**
```bash
cd frontend
npm install
# .env: REACT_APP_API_URL=http://localhost:5000/api
npm start
```

**Admin user:** `cd backend` → `node scripts/createAdmin.js`  
Ya signup page se Role = Admin (phone + location required).

**Env variables (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/appointment-booking
JWT_SECRET=your_secret_min_10_chars
RAZORPAY_KEY_ID=optional
RAZORPAY_KEY_SECRET=optional
```

---

## 📚 API (summary)

Base: `http://localhost:5000/api`  
Full detail: **[docs/API.md](docs/API.md)**

| Type | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Profile | `GET /auth/profile`, `PUT /auth/profile`, `PUT /auth/profile/password` |
| Appointments | `POST /appointments`, `GET /appointments/my-appointments`, `PUT /:id/cancel` |
| Admin | `GET /appointments`, `PUT /:id/accept`, `PUT /:id/status`, `GET /auth/users` |
| Payments | `POST /payments/create-order`, `POST /payments/verify` |

Query params: `?status=`, `?date=`, `?search=` (GET appointments).

---

## 👥 Roles

**User:** Book appointments, my appointments, profile, change password, pay, cancel.  
**Admin:** Above + all appointments, accept (with admin details), update status, view all users.

---

## 🔧 Scripts

```bash
node backend/scripts/checkAdmin.js
node backend/scripts/updateAdmin.js <email> <phone> <location>
node backend/scripts/verifyDatabase.js
```

---

## 🔒 Security

bcryptjs, JWT (1h), protected routes, express-validator + react-hook-form validation, centralized error handling.

---

## 📝 License

ISC · MERN stack
