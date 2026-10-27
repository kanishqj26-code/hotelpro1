# RoomsForUse — Full-Stack Hotel Room Booking and Management System

A complete, production-grade MERN architecture web application designed for hotel room reservation, customer stay management, and comprehensive hotel administration.

## 🏨 Project Overview
**RoomsForUse** enables guests to discover available Deluxe and Non-Deluxe hotel rooms, check real-time date availability, execute test payment workflows, view digital tax invoices, and cancel reservations with instant room availability release. Administrators have a protected portal to monitor all bookings, manage room inventory, view registered users, and analyze revenue and occupancy metrics.

---

## 🎨 Visual Design & Screenshot Alignment
The application directly implements the visual layout and color palette specified in the project screenshots:
- **Registration Page (`k1_26626adb.png`)**: Left-side vector illustration of desk, contract signing, and floral art; right-side registration form with Full Name, Email, Password, Mobile No, and "SELECT USER" dropdown.
- **Login Page (`k2_10e5ee69.png`)**: Vector illustration alongside compact login form with one-click viva test credentials.
- **Room Cards (`k3_d46329c8.png`)**: Card format with photo, Room Type, Capacity, Rent per day, Description, and "LEARN MORE" / "BOOK NOW" actions.
- **My Bookings (`k4_13265a69.png`)**: Purple gradient header with greeting (`Hi, [name]`), tab strip, clean cards featuring red `CANCELLED` and green `BOOKED` badges, Booking ID, From/To stay dates, Total Amount, Customer Phone, and "CANCEL BOOKING" button.
- **All Rooms Table (`k5_7853ef43.png`)**: Blue/dark header band "Hotel Room Booking History", showing Room ID, Room Number, Capacity, Rent/Day, Type (green Delux badge), and Description.
- **Add Room Form (`k6_d5bc1443.png`)**: Blue header "Add a New Room", input fields for Room Number, Max Capacity, Room Rent, 3 Image URLs, Delux / Non-Delux radio buttons, and Description.
- **All Users Table (`k7_aab5be02.png`)**: Dark table header "All Registered Users", showing User ID, Name, Email, Phone, and Type badges (green Admin, blue Ordinary).

---

## 🚀 Key Features

### Customer Features:
1. **Secure Authentication**: Customer registration and login with bcrypt password hashing and JWT authorization tokens.
2. **Search & Availability Engine**: Filter rooms by check-in / check-out date intervals, guest count, category (Delux vs Non-Delux), and pricing.
3. **Overlapping Booking Protection**: The backend verifies that `(checkIn < bookedCheckOut && checkOut > bookedCheckIn)` to prevent double booking.
4. **Test Payment Workflow**: Simulated Razorpay / UPI / Card / NetBanking checkout with test transaction records.
5. **My Bookings History**: View active and historical reservations with status badges.
6. **Self-Service Cancellation**: Cancel bookings prior to check-in with immediate room release back into the catalogue.
7. **Official Tax Invoices**: View and print PDF-ready hotel tax invoices with room details, rates, and transaction IDs.
8. **Customer Profile**: Update contact details and passwords.

### Administrator Features:
1. **Protected Admin Dashboard**: Restricted with server-side role verification (`adminOnly` middleware).
2. **All Bookings**: Comprehensive listing with search, status filtering, invoice inspection, and cancellation overrides.
3. **All Rooms Inventory**: Table of all hotel rooms with capacity, rates, category, and real-time operational status.
4. **Add Room**: Create new rooms with 3 image URLs, capacity, rent per day, and descriptions.
5. **Edit & Delete Rooms**: Modify room attributes or safely delete rooms (protected against deleting rooms with active future reservations).
6. **All Users Management**: List all registered users with phone numbers, emails, and promote/demote role capabilities.
7. **Business Analytics & Reports**: Live metrics derived from the database (Total Rooms, Total Users, Total Bookings, Confirmed, Cancelled, Revenue, and Occupancy Rate).

---

## 🔑 Demo & Viva Credentials
Pre-seeded in the database for instant viva demonstration:

| Role | Name | Email | Password | Phone |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | sun | `s@gmail.com` | `admin123` | `9704927807` |
| **Administrator** | tousif | `tousif@gmail.com` | `admin123` | `9704927891` |
| **Customer** | sid | `sid@gmail.com` | `customer123` | `9704927807` |
| **Customer** | rohan | `rohan3@gmail.com` | `customer123` | `9704927800` |
| **Customer** | saisunny | `sai@gmail.com` | `customer123` | `9704927807` |

*(You can also use the **Demo Switcher** button in the top navigation bar to switch between accounts with 1 click)*.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons.
- **Backend**: Node.js, Express.js REST API with MVC architectural pattern.
- **Database**: Mongoose-like persistent JSON store (`/data/roomsforuse_db.json`) supporting full CRUD, query filters, timestamps, and 24-character hexadecimal ObjectIds (`68d230b8e24b51e6c5a22ad5`).
- **Security**: JWT bearer authentication, bcrypt password hashing, input sanitization, and role-based access control (RBAC).
- **Payment Gateway**: Test Mode simulated Razorpay / Indian UPI / Card flow.

---

## 📦 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer or admin.
- `POST /api/auth/login` — Login and receive JWT token.
- `GET /api/auth/me` — Retrieve authenticated user profile.
- `PUT /api/auth/profile` — Update customer name, phone, or password.

### Rooms (`/api/rooms`)
- `GET /api/rooms` — List rooms with date availability and capacity filters.
- `GET /api/rooms/:id` — Get single room details and active booked intervals.
- `GET /api/rooms/availability` — Validate date overlap for a room.
- `POST /api/rooms` — (Admin) Add a new room.
- `PUT /api/rooms/:id` — (Admin) Update room details.
- `DELETE /api/rooms/:id` — (Admin) Delete a room safely.

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Create a reservation.
- `GET /api/bookings/my` — Get authenticated customer's bookings.
- `GET /api/bookings/:id` — Get booking details.
- `PATCH /api/bookings/:id/cancel` — Cancel an eligible reservation.
- `GET /api/admin/bookings` — (Admin) View all bookings.
- `PATCH /api/admin/bookings/:id/status` — (Admin) Update booking status.

### Payments (`/api/payments`)
- `POST /api/payments/create-order` — Create a simulated Razorpay payment order.
- `POST /api/payments/verify` — Verify transaction and confirm reservation.
- `GET /api/payments/my` — Customer payment receipts.
- `GET /api/admin/payments` — (Admin) All transaction logs.

### Administration (`/api/admin`)
- `GET /api/admin/stats` — Live metrics: revenue, bookings, rooms, users, occupancy.
- `GET /api/admin/users` — List registered users.
- `PATCH /api/admin/users/:id/role` — Toggle user role (Admin / Customer).
