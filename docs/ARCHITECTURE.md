# 🏗️ Architecture – Appointment Booking

Project ka structure, data flow, aur main concepts.

---

## 1. Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, React Router v6, React Hook Form, Yup, Axios, Context API, React Toastify |
| Backend  | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth     | JWT (1 hour expiry), bcryptjs |
| Payment  | Razorpay (optional) |
| Validation | express-validator (backend), react-hook-form + yup (frontend) |

---

## 2. Project Structure (High Level)

```
Appointment/
├── backend/          # REST API
│   ├── controllers/  # Business logic
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── middleware/   # auth, admin, errorHandler
│   ├── validators/   # express-validator rules
│   ├── utils/        # e.g. generateToken
│   └── scripts/      # createAdmin, checkAdmin, updateAdmin, verifyDatabase
│
├── frontend/         # React SPA
│   └── src/
│       ├── components/  # Navbar, PrivateRoute, AdminRoute
│       ├── pages/       # Login, Signup, Dashboard, Profile, Admin, etc.
│       ├── context/     # AuthContext
│       ├── hooks/       # useAuth
│       ├── services/    # api.js (axios + interceptors)
│       └── App.js       # Routes + AuthProvider
│
└── docs/             # Documentation
```

---

## 3. Authentication Flow

1. **Register / Login**  
   Backend email+password validate karta hai, user create/find karta hai, JWT generate karta hai.  
   Frontend token `localStorage` mein save karta hai aur axios default header mein `Authorization: Bearer <token>` set karta hai.

2. **Protected routes**  
   - `PrivateRoute`: Login check; nahi hai to `/login` par redirect.  
   - `AdminRoute`: Login + `role === 'admin'`; nahi to `/` ya login.

3. **Token expiry**  
   JWT 1 hour baad expire.  
   Backend 401 bhejta hai → frontend axios interceptor token clear karta hai, `auth:logout` event fire karta hai, user ko login par bhej sakta hai.

4. **Auth context**  
   `AuthProvider` user, token, login, register, logout expose karta hai.  
   `useAuth()` se koi bhi component user/login state use kar sakta hai.

---

## 4. User Roles

| Role  | Access |
|-------|--------|
| User  | Book appointment, my appointments, profile, change password, pay, cancel own |
| Admin | Sab user features + all appointments, accept appointment, update status, all users list |

- Admin signup/creation par **phone** aur **location** required (accept appointment ke liye).
- Accept karne par yehi details appointment par save hoti hain; user ko "Accepted by" dikhti hain.

---

## 5. Appointment Flow

1. **Create:** User service type, date, time, amount bhar kar book karta hai.  
   Backend same date+time duplicate check karta hai.  
   Payment Razorpay se (optional); agar Razorpay off ho to direct "paid" mark ho sakta hai.

2. **Accept (Admin):** Admin "Accept" click karta hai → backend current admin ka name, phone, location appointment par save karta hai, status `accepted` hota hai.

3. **Status:** `booked` → `accepted` → `completed` / `cancelled`.  
   Admin status dropdown se bhi update kar sakta hai (valid transitions).

4. **Search & filter:**  
   `GET /appointments/my-appointments` aur `GET /appointments` (admin) query params lete hain:  
   `status`, `date`, `search` (service type / admin name).  
   Backend MongoDB query in params se filter karta hai.

---

## 6. Data Models (MongoDB)

**User**
- name, email, password (hashed), role (user/admin)
- phone, location (admin ke liye use)

**Appointment**
- userId (ref User), serviceType, date, timeSlot, amount
- paymentStatus (pending/paid), status (booked/accepted/completed/cancelled)
- acceptedBy (ref User), adminName, adminPhone, adminLocation, acceptedAt

---

## 7. API Layer

- **Routes** sirf path define karte hain aur middleware/controllers ko chain karte hain.  
- **Validators** (express-validator) body/params validate karte hain; fail par 400 + message.  
- **Middleware:**  
  - `auth`: JWT verify, `req.user` set.  
  - `admin`: `req.user.role === 'admin'` check.  
  - `errorHandler`: Centralized error → `{ success: false, message }` + status code.

---

## 8. Frontend Routing

| Route              | Access   | Component        |
|--------------------|----------|-------------------|
| `/`                | Public   | Home              |
| `/login`           | Public   | Login             |
| `/signup`          | Public   | Signup            |
| `/book-appointment`| Private  | BookAppointment   |
| `/my-appointments`  | Private  | MyAppointments    |
| `/profile`         | Private  | Profile           |
| `/admin`           | Admin    | AdminDashboard    |
| `*`                | Redirect | `/`               |

---

## 9. Security (Summary)

- Passwords: bcrypt hash, kabhi response mein nahi bhejte.
- JWT: 1h expiry; secret `.env` se.
- Protected routes frontend + backend dono taraf (auth/admin middleware).
- Input: backend par express-validator, frontend par react-hook-form + yup.
- Errors: centralized handler; stack trace sirf development mein.

Detailed API: [API.md](./API.md).  
Setup: [SETUP.md](./SETUP.md).
