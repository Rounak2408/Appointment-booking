# 📅 Appointment Booking System

A complete MERN stack appointment booking system with Razorpay payment integration, admin management, and mobile-responsive design.

## ✨ Features

- 🔐 JWT-based authentication (User & Admin roles)
- 📅 Appointment booking with conflict prevention
- 💳 Razorpay payment integration (optional)
- 👤 User dashboard with statistics
- 👨‍💼 Admin dashboard for managing appointments
- 📱 Fully mobile responsive design
- 🎨 Modern dark theme UI

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Razorpay  
**Frontend:** React 18, React Router, Axios, Context API

## 📁 Project Structure

```
Appointment/
├── backend/                     # Node.js + Express Backend
│   ├── controllers/             # Business Logic
│   │   ├── authController.js
│   │   ├── appointmentController.js
│   │   └── paymentController.js
│   ├── models/                 # Database Schemas
│   │   ├── User.js
│   │   └── Appointment.js
│   ├── routes/                 # API Routes
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── paymentRoutes.js
│   ├── middleware/             # Express Middleware
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── errorHandler.js
│   ├── scripts/                # Utility Scripts
│   │   ├── createAdmin.js
│   │   ├── checkAdmin.js
│   │   ├── updateAdmin.js
│   │   └── verifyDatabase.js
│   ├── env.example
│   ├── package.json
│   └── server.js
│
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/          # UI Components
│   │   │   ├── Navbar.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── AdminRoute.js
│   │   ├── pages/               # Page Components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── BookAppointment.js
│   │   │   ├── MyAppointments.js
│   │   │   └── AdminDashboard.js
│   │   ├── context/             # State Management
│   │   │   └── AuthContext.js
│   │   ├── hooks/               # Custom Hooks
│   │   │   └── useAuth.js
│   │   ├── services/            # API Integration
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── responsive.css
│   ├── public/
│   │   └── index.html
│   ├── env.example
│   └── package.json
│
├── docs/                        # Documentation
│   ├── HOW_TO_CHECK_MONGODB.md
│   ├── MONGODB_COMPASS_FIX.md
│   ├── MONGODB_COMPASS_GUIDE.md
│   └── UPDATE_ADMIN_GUIDE.md
│
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Razorpay account (optional)

### Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET
npm start
```

**Environment Variables (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/appointment-booking
JWT_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key (optional)
RAZORPAY_KEY_SECRET=your_razorpay_secret (optional)
```

### Frontend Setup

```bash
cd frontend
npm install
cp env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:5000/api
npm start
```

### Create Admin User

```bash
cd backend
node scripts/createAdmin.js
```

Or use the signup page and select "Admin" role (requires phone & location).

## 📚 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Appointments
- `POST /appointments` - Create appointment
- `GET /appointments/my-appointments` - Get user appointments
- `PUT /appointments/:id/cancel` - Cancel appointment
- `PUT /appointments/:id/accept` - Accept appointment (Admin)
- `GET /appointments` - Get all appointments (Admin)

### Payments
- `POST /payments/create-order` - Create Razorpay order
- `POST /payments/verify` - Verify payment

## 👥 User Roles

**User:**
- Book appointments
- View own appointments
- Make payments
- Cancel appointments

**Admin:**
- All user features
- View all appointments
- Accept appointments
- Manage appointment status
- View all users

## 📱 Mobile Responsive

Fully responsive design with:
- Mobile menu navigation
- Card-based layouts on mobile
- Touch-friendly buttons
- Optimized for all screen sizes

## 🔧 Utility Scripts

```bash
# Check admin users
node backend/scripts/checkAdmin.js

# Update admin details
node backend/scripts/updateAdmin.js <email> <phone> <location>

# Verify database
node backend/scripts/verifyDatabase.js
```

## 📖 Documentation

See `docs/` folder for detailed guides:
- MongoDB setup and troubleshooting
- Admin user management
- Database verification

## 🔒 Security

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes
- Role-based access control
- Payment signature verification

## 📝 License

ISC

## 👨‍💻 Author

Built with ❤️ using MERN stack
