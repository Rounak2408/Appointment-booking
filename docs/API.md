# 📡 API Reference

Base URL: `http://localhost:5000/api`  
Content-Type: `application/json`  
Auth: `Authorization: Bearer <token>`

---

## Response Format

**Success:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 1. Authentication

### POST `/auth/register`

Naya user (user ya admin) register karta hai.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "phone": "9876543210",
  "location": "Mumbai"
}
```

- `name` (required), min 2 chars  
- `email` (required), valid email  
- `password` (required), min 8 chars  
- `role`: `"user"` | `"admin"` (default: user)  
- `phone`, `location`: **Required** agar `role` = `"admin"`. Phone 10 digits.

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": null,
      "location": null
    }
  }
}
```

---

### POST `/auth/login`

Login – email/password se token milta hai.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": null,
      "location": null
    }
  }
}
```

---

### GET `/auth/me`

Current logged-in user. **Auth required.**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": null,
      "location": null
    }
  }
}
```

---

## 2. Profile

### GET `/auth/profile`

Logged-in user ka full profile. **Auth required.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": null,
      "location": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

### PUT `/auth/profile`

Profile update (name, email; admin ke liye phone, location bhi). **Auth required.**

**Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "phone": "9876543210",
  "location": "Delhi"
}
```

Sab fields optional. Admin ke liye phone 10 digits, location min 3 chars.

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Updated",
      "email": "john.new@example.com",
      "role": "admin",
      "phone": "9876543210",
      "location": "Delhi"
    }
  }
}
```

---

### PUT `/auth/profile/password`

Password change. **Auth required.**

**Body:**
```json
{
  "currentPassword": "oldPass123",
  "newPassword": "newPass456"
}
```

- `newPassword` min 8 chars.

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 3. Users (Admin only)

### GET `/auth/users`

Saare registered users. **Auth + Admin required.**

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "users": [
      {
        "_id": "...",
        "name": "John",
        "email": "john@example.com",
        "role": "user",
        "createdAt": "..."
      }
    ]
  }
}
```

---

## 4. Appointments

### POST `/appointments`

Naya appointment create. **Auth required.**

**Body:**
```json
{
  "serviceType": "Consultation",
  "date": "2025-03-01",
  "timeSlot": "10:00 AM",
  "amount": 500
}
```

- `serviceType`: `Consultation` | `Checkup` | `Follow-up` | `Emergency`  
- `date`: ISO date, aaj ya future  
- `timeSlot`: e.g. `"10:00 AM"`  
- `amount`: number, optional (default 500)

**Response (201):**
```json
{
  "success": true,
  "message": "Appointment created successfully...",
  "data": {
    "appointment": {
      "_id": "...",
      "userId": "...",
      "serviceType": "Consultation",
      "date": "2025-03-01T00:00:00.000Z",
      "timeSlot": "10:00 AM",
      "amount": 500,
      "paymentStatus": "pending",
      "status": "booked",
      ...
    }
  }
}
```

---

### GET `/appointments/my-appointments`

Current user ke appointments. **Auth required.**

**Query params (optional):**
- `status`: `booked` | `accepted` | `completed` | `cancelled`
- `date`: `YYYY-MM-DD`
- `search`: service type par search

**Example:** `GET /appointments/my-appointments?status=booked&date=2025-03-01`

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "appointments": [
      {
        "_id": "...",
        "serviceType": "Consultation",
        "date": "...",
        "timeSlot": "10:00 AM",
        "amount": 500,
        "paymentStatus": "paid",
        "status": "accepted",
        "adminName": "Admin Name",
        "adminPhone": "9876543210",
        "adminLocation": "Mumbai",
        "userId": { "name": "...", "email": "..." }
      }
    ]
  }
}
```

---

### GET `/appointments/:id`

Single appointment by ID. **Auth required.** User apna hi dekh sakta hai, admin koi bhi.

**Response (200):** Same structure as one appointment in list above.

---

### PUT `/appointments/:id/cancel`

Appointment cancel. **Auth required.** Sirf owner cancel kar sakta hai.

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": { "appointment": { ... } }
}
```

---

### GET `/appointments` (Admin)

Saare appointments. **Auth + Admin required.**

**Query params (optional):**
- `status`: `booked` | `accepted` | `completed` | `cancelled`
- `date`: `YYYY-MM-DD`
- `search`: service type ya admin name par search

**Response (200):** Same as `my-appointments` but all users’ appointments.

---

### PUT `/appointments/:id/accept` (Admin)

Appointment accept karke admin apna name, phone, location save karta hai. **Auth + Admin required.**  
Admin ke profile mein phone aur location required.

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment accepted successfully",
  "data": {
    "appointment": {
      "_id": "...",
      "status": "accepted",
      "acceptedBy": "...",
      "adminName": "...",
      "adminPhone": "...",
      "adminLocation": "...",
      "acceptedAt": "...",
      ...
    }
  }
}
```

---

### PUT `/appointments/:id/status` (Admin)

Status update (booked/accepted/completed/cancelled). **Auth + Admin required.**

**Body:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated",
  "data": { "appointment": { ... } }
}
```

---

## 5. Payments

### POST `/payments/create-order`

Razorpay order create. **Auth required.**

**Body:**
```json
{
  "appointmentId": "appointment_mongo_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxx",
    "amount": 50000,
    "keyId": "rzp_test_xxx",
    "paymentSkipped": false
  }
}
```

Agar Razorpay configure nahi hai to `paymentSkipped: true` ho sakta hai aur appointment direct paid mark ho sakta hai.

---

### POST `/payments/verify`

Payment verify (Razorpay response ke baad). **Auth required.**

**Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "xxx",
  "appointmentId": "appointment_mongo_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

---

## 6. Health

### GET `/api/health`

Server health check (no auth).

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-02-17T..."
}
```

---

## Error Codes

| Code | Meaning |
|------|--------|
| 400 | Bad Request – validation / invalid input |
| 401 | Unauthorized – no/invalid/expired token |
| 403 | Forbidden – role not allowed (e.g. non-admin) |
| 404 | Not Found – resource ID not found |
| 500 | Server Error |

Validation errors: `message` mein exact error aata hai (e.g. "Email is required", "Password must be at least 8 characters").
