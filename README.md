# 📅 Appointment Booking System

A complete, production-ready appointment booking system built with the MERN stack (MongoDB, Express.js, React, Node.js) with Razorpay payment integration.

> **📚 Documentation:** For additional guides and troubleshooting, see the [docs](./docs/) folder.

## Features

- ✅ User authentication (JWT-based)
- ✅ Role-based access control (User & Admin)
- ✅ Appointment booking with conflict prevention
- ✅ Razorpay payment integration
- ✅ User dashboard to view and manage appointments
- ✅ Admin dashboard to manage all appointments
- ✅ Clean, modular code structure
- ✅ RESTful API design

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Razorpay for payments

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- Context API for state management

## Project Structure

```
Appointment/
├── backend/                    # Node.js + Express backend
│   ├── controllers/            # Business logic
│   │   ├── authController.js   # Authentication logic
│   │   ├── appointmentController.js  # Appointment management
│   │   └── paymentController.js     # Payment processing
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js             # User model
│   │   └── Appointment.js      # Appointment model
│   ├── routes/                 # API endpoints
│   │   ├── authRoutes.js       # Auth routes
│   │   ├── appointmentRoutes.js # Appointment routes
│   │   └── paymentRoutes.js    # Payment routes
│   ├── middleware/             # Middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── admin.js            # Admin role check
│   │   └── errorHandler.js     # Error handling
│   ├── scripts/                # Utility scripts
│   │   ├── createAdmin.js     # Create admin user
│   │   ├── checkAdmin.js       # Check admin users
│   │   ├── updateAdmin.js      # Update admin details
│   │   └── verifyDatabase.js   # Verify database
│   ├── env.example             # Environment variables template
│   ├── package.json            # Backend dependencies
│   └── server.js               # Main server file
│
├── frontend/                   # React frontend
│   ├── public/                 # Public assets
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.js       # Navigation bar
│   │   │   ├── PrivateRoute.js # Protected routes
│   │   │   └── AdminRoute.js   # Admin-only routes
│   │   ├── pages/              # Page components
│   │   │   ├── Home.js         # Home page
│   │   │   ├── Login.js        # Login page
│   │   │   ├── Signup.js       # Signup page
│   │   │   ├── BookAppointment.js # Book appointment
│   │   │   ├── MyAppointments.js  # User dashboard
│   │   │   └── AdminDashboard.js  # Admin dashboard
│   │   ├── context/            # React Context
│   │   │   └── AuthContext.js  # Authentication context
│   │   ├── hooks/              # Custom hooks
│   │   │   └── useAuth.js      # Auth hook
│   │   ├── services/           # API services
│   │   │   └── api.js          # Axios configuration
│   │   ├── App.js              # Main App component
│   │   ├── App.css             # App styles
│   │   ├── index.js            # Entry point
│   │   └── index.css           # Global styles
│   ├── env.example             # Frontend env template
│   └── package.json            # Frontend dependencies
│
├── docs/                       # Documentation
│   ├── README.md               # Documentation index
│   ├── MONGODB_COMPASS_GUIDE.md
│   ├── MONGODB_COMPASS_FIX.md
│   ├── HOW_TO_CHECK_MONGODB.md
│   └── UPDATE_ADMIN_GUIDE.md
│
└── README.md                   # Main project README
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Razorpay account (optional - for payment integration)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
copy env.example .env
# Or on Linux/Mac: cp env.example .env
```

4. Edit `.env` file and set:
   - `MONGODB_URI`: MongoDB connection string (required)
   - `JWT_SECRET`: Any random string (required)
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Optional (for payments)

5. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

#### Create Admin User

To create an admin user, you have two options:

**Option 1: Using the script (Recommended)**
```bash
cd backend
node scripts/createAdmin.js
```

This will create an admin user with:
- Email: `admin@example.com`
- Password: `admin123`
- Name: `Admin User`

You can modify these credentials in `backend/scripts/createAdmin.js` before running.

**Option 2: Using Signup Page**
1. Go to the Signup page (`http://localhost:3000/signup`)
2. Fill in the form
3. Select "Admin" from the Role dropdown
4. Complete registration

**Note:** After creating an admin user, you can login and access the Admin Dashboard to manage all appointments and users.

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer jwt_token_here
```

### Appointment Endpoints

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "serviceType": "Consultation",
  "date": "2024-12-25",
  "timeSlot": "10:00 AM",
  "amount": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully. Please complete payment.",
  "data": {
    "appointment": {
      "_id": "appointment_id",
      "userId": "user_id",
      "serviceType": "Consultation",
      "date": "2024-12-25T00:00:00.000Z",
      "timeSlot": "10:00 AM",
      "status": "booked",
      "paymentStatus": "pending",
      "amount": 500
    }
  }
}
```

#### Get My Appointments
```http
GET /api/appointments/my-appointments
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "appointments": [...]
  }
}
```

#### Get Single Appointment
```http
GET /api/appointments/:id
Authorization: Bearer jwt_token_here
```

#### Cancel Appointment
```http
PUT /api/appointments/:id/cancel
Authorization: Bearer jwt_token_here
```

#### Get All Appointments (Admin Only)
```http
GET /api/appointments
Authorization: Bearer jwt_token_here (admin)
```

#### Update Appointment Status (Admin Only)
```http
PUT /api/appointments/:id/status
Authorization: Bearer jwt_token_here (admin)
Content-Type: application/json

{
  "status": "completed" // "booked", "cancelled", or "completed"
}
```

### Payment Endpoints

#### Create Payment Order
```http
POST /api/payments/create-order
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "appointmentId": "appointment_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_razorpay_id",
    "amount": 50000,
    "currency": "INR",
    "keyId": "razorpay_key_id"
  }
}
```

#### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature",
  "appointmentId": "appointment_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and appointment confirmed successfully",
  "data": {
    "appointment": {...}
  }
}
```

## User Roles

### User Role
- Register and login
- Book appointments
- View own appointments
- Cancel own appointments
- Make payments

### Admin Role
- All user privileges
- View all appointments
- Update appointment status
- Cancel any appointment

## Payment Flow

1. User books an appointment (status: `pending` payment)
2. User clicks "Pay Now" on the appointment
3. Razorpay checkout opens
4. User completes payment
5. Payment is verified on backend
6. Appointment status changes to `booked` and payment status to `paid`

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `RAZORPAY_KEY_ID`: Razorpay API key ID
- `RAZORPAY_KEY_SECRET`: Razorpay API key secret

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes (frontend & backend)
- Role-based access control
- Payment signature verification
- Input validation
- Error handling middleware

## Testing the Application

1. **Create an Admin User:**
   - Sign up with role "admin"
   - Or manually update user role in MongoDB

2. **Create a Regular User:**
   - Sign up with role "user" (default)

3. **Book an Appointment:**
   - Login as user
   - Go to "Book Appointment"
   - Fill the form and submit

4. **Make Payment:**
   - Go to "My Appointments"
   - Click "Pay Now" on pending payment
   - Use Razorpay test credentials

5. **Admin Functions:**
   - Login as admin
   - Go to "Admin Dashboard"
   - View and manage all appointments

## Razorpay Test Credentials

For testing, use Razorpay test mode:
- Get test credentials from Razorpay Dashboard
- Use test card: 4111 1111 1111 1111
- Any future expiry date
- Any CVV

## Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **CORS Error:**
   - Backend CORS is configured to allow all origins in development
   - For production, update CORS settings

3. **Payment Not Working:**
   - Verify Razorpay credentials in `.env`
   - Check Razorpay dashboard for API keys
   - Ensure Razorpay script is loaded in frontend

## Production Deployment

1. Update environment variables for production
2. Use strong JWT secret
3. Configure CORS for specific domains
4. Use MongoDB Atlas or production MongoDB
5. Build React app: `npm run build`
6. Serve frontend build with a web server (Nginx, etc.)

## License

ISC

## Author

Built as a complete MERN stack project for learning and demonstration purposes.
