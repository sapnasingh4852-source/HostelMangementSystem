# Hostel Room Allotment & Mess Management System

A production-grade, centralized web application built for colleges, universities, and educational institutions to manage hostel residential blocks, room capacities, student allotments, maintenance complaint ticketing, room-change transfers, weekly mess dining menus, meal quality feedback, and monthly catering bills.

Built with **Node.js, Express.js, EJS, Bootstrap 5, and MongoDB (Mongoose ODM)** using server-side rendering (SSR) and strict role-based access control.

---

## 🌟 Key Features

### 👨‍🎓 Student Portal
* **Account Registration & Authentication**: Role-based access protected by bcrypt password hashing and MongoDB session storage.
* **Profile Management**: View and edit department, contact details, year/semester, and gender.
* **Browse Available Rooms**: Filter rooms by Hostel Block, Room Type (Single, Double, Triple, Dormitory), Floor level, and Amenities. Real-time visual capacity and vacant bed calculation.
* **Room Allotment Application**: Request preferred room with duplicate prevention guards (only 1 active request or 1 active allotment allowed per student).
* **My Room Dashboard**: Full details of current accommodation, floor, amenities, and directory of assigned roommates with email links.
* **Atomic Room Vacating**: Relinquish room allotment with automated, concurrency-safe bed vacancy restoration.
* **Room Change Requests**: Apply for a room transfer to other vacant rooms with administrative approval workflows.
* **Maintenance Complaint Desk**: Report electrical, plumbing, fan, light, Wi-Fi, or furniture issues with priority levels (Low, Medium, High, Emergency) and track real-time resolution remarks.
* **Weekly Mess Menu**: Interactive 7-day 4-meal (Breakfast, Lunch, Snacks, Dinner) calendar that automatically highlights the current day of the week.
* **Daily Meal Feedback**: Submit 1 to 5-star ratings and suggestions for daily meals to monitor food quality.
* **Monthly Mess Billing**: View attendance-calculated mess fee statements (`Present Days × Per-Day Rate`).

---

### 🛡️ Warden & Administrator Portal
* **Interactive Operations Dashboard**:
  * Real-time KPI statistics: Total Students, Blocks, Rooms, Total Beds, Occupied Beds, Available Beds, and Campus Occupancy Percentage.
  * **Chart.js Visualizations**: Block-Wise Occupancy (Bar Chart) and Bed Utilization (Doughnut Chart).
  * Block-wise capacity progress bars and quick decision queue for pending room applications.
* **Hostel Block Management**: Full CRUD for blocks (Name, Code, Floors, Gender residency rules, Operational status). Deletion is blocked if active rooms exist.
* **Room Management**: Full CRUD with strict capacity validation (cannot reduce room capacity below current occupant count; deletion is blocked if students are currently allotted).
* **Concurrency-Safe Room Allotment**:
  * Atomic MongoDB update (`findOneAndUpdate` checking `currentOccupancy < capacity`) preventing race conditions or overbooking even under simultaneous warden approvals.
  * Automated status transition to `Full` upon reaching maximum capacity.
* **Room Transfer Processing**: Atomic swap decreasing source room occupancy and increasing destination room occupancy in a single transaction-like workflow.
* **Maintenance Ticketing Queue**: Filter by Category, Priority, Block, and Status. Assign technicians, update status (`In Progress`, `Resolved`, `Rejected`), and append resolution notes.
* **Weekly Mess Menu Planner**: Draft, edit, schedule, and publish weekly 7-day menus.
* **Meal Feedback Analytics**: Overall catering rating, today's live average, meal-wise breakdown (Breakfast, Lunch, Snacks, Dinner), and student reviews.
* **Student Directory & Manual Vacate**: Complete student registry with search/filter capabilities and warden one-click room vacating.
* **Monthly Mess Billing Engine**: Automated monthly fee generator for active residents (`Present Days × Daily Rate`) with payment status tracking (`Unpaid`, `Paid`, `Waived`).
* **Official Institutional Reports**: Printable and PDF-friendly campus occupancy and resident roster reports.

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Templating Engine**: EJS (Server-Side Rendering)
* **Database**: MongoDB (Atlas compatible) with Mongoose ODM
* **Session Management**: `express-session` with `connect-mongo` session storage
* **Authentication & Security**: `bcryptjs`, `express-validator`, input sanitization, HTTP-only secure cookies
* **Styling & UI**: Bootstrap 5.3.3, Bootstrap Icons, custom CSS, Chart.js 4.4
* **Utilities**: `method-override` (RESTful PUT/DELETE in HTML forms), `connect-flash`, `dotenv`, `morgan`

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* MongoDB instance running locally (e.g. `mongodb://127.0.0.1:27017`) OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection URI.

### 2. Clone / Open Directory
```bash
cd /Users/sapnasingh/.gemini/antigravity/scratch/hostel-management-system
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `.env` contains your desired settings:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/hostel_db
SESSION_SECRET=hostel_system_secure_secret_key_2026
NODE_ENV=development
```
*(If connecting to MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string).*

### 5. Seed Sample Dataset
Populate demo users, hostel blocks, rooms, mess menus, sample maintenance tickets, and feedback:
```bash
npm run seed
```

### 6. Start the Server
Development mode (with auto-reload):
```bash
npm run dev
```
Or standard production start:
```bash
npm start
```
Visit **http://localhost:3000** in your web browser.

---

## 🔑 Pre-Configured Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Warden / Admin** | `admin@hostel.com` | `Admin@123` | Full administrative control |
| **Student 1** | `student1@example.com` | `Student@123` | Allotted to **Room A-102** |
| **Student 2** | `student2@example.com` | `Student@123` | Allotted to **Room B-201** |
| **Student 3** | `student3@example.com` | `Student@123` | Room Request **Pending** |
| **Student 4** | `student4@example.com` | `Student@123` | Unallotted (Ready to apply) |

---

## 🔒 Data Integrity & Concurrency Architecture

1. **Overbooking Prevention**:
   Allotments use atomic MongoDB operations ensuring occupancy is never incremented if `currentOccupancy >= capacity`:
   ```javascript
   const updatedRoom = await Room.findOneAndUpdate(
     {
       _id: roomId,
       status: 'Available',
       $expr: { $lt: ['$currentOccupancy', '$capacity'] }
     },
     { $inc: { currentOccupancy: 1 } },
     { new: true }
   );
   ```
2. **Safe Vacating**:
   When a student vacates, occupancy decreases automatically using `$max: [0, { $subtract: ['$currentOccupancy', 1] }]`, guaranteeing occupancy never becomes negative and flipping room status back to `Available`.
3. **Capacity Constraints**:
   An administrator cannot reduce a room's capacity to a number lower than its current active occupants.
4. **Referential Integrity**:
   Hostel blocks cannot be deleted if rooms are assigned to them, and rooms cannot be deleted if students are currently living in them.

---

## 📁 Project Architecture

```
hostel-management-system/
├── config/
│   └── db.js                 # MongoDB Mongoose connection
├── controllers/
│   ├── adminController.js    # KPIs, Chart.js metrics, directory, reports
│   ├── allotmentController.js# Atomic room allotments & room changes
│   ├── authController.js     # Login, registration, session teardown
│   ├── billController.js     # Monthly mess billing engine
│   ├── blockController.js    # Hostel block CRUD
│   ├── feedbackController.js # Meal rating & analytics
│   ├── maintenanceController.js # Issue tickets & statuses
│   ├── messController.js     # Weekly 7-day meal schedules
│   ├── roomController.js     # Room inventory & capacity guards
│   └── studentController.js  # Student dashboard, my-room, catalog
├── middleware/
│   ├── auth.js               # isAuthenticated, isStudent, isAdmin, guestOnly
│   ├── errorHandler.js       # 404 & 500 handlers
│   └── validation.js         # express-validator rules
├── models/
│   ├── HostelBlock.js
│   ├── MaintenanceRequest.js
│   ├── MealFeedback.js
│   ├── MessBill.js
│   ├── MessMenu.js
│   ├── Room.js
│   ├── RoomAllotment.js
│   ├── RoomChangeRequest.js
│   └── User.js
├── public/
│   ├── css/style.css         # Modern responsive styles
│   └── js/main.js            # Auto-alerts & dynamic filters
├── routes/
│   ├── adminRoutes.js
│   ├── allotmentRoutes.js
│   ├── authRoutes.js
│   ├── blockRoutes.js
│   ├── messRoutes.js
│   ├── roomRoutes.js
│   └── studentRoutes.js
├── seeds/
│   └── seed.js               # Comprehensive test dataset
├── utils/
│   └── helpers.js            # Formatters, badges & calculations
├── views/
│   ├── admin/                # Admin dashboards, blocks, rooms, mess, bills
│   ├── auth/                 # Login & student registration
│   ├── partials/             # Header, navbar, footer, alerts
│   ├── public/               # Modern landing page
│   ├── student/              # Student dashboard, rooms, my-room, etc.
│   ├── 404.ejs
│   └── error.ejs
├── .env.example
├── .gitignore
├── app.js                    # Server entrypoint
├── package.json
└── README.md
```

---

## 🧪 Verification & Testing Scenarios

1. **Student Registration & Login**:
   * Navigate to `/register`, create an account, log in, and verify session persistence.
2. **Room Request & Admin Approval**:
   * Log in as `student4@example.com`, browse rooms, request Room A-101.
   * Log in as `admin@hostel.com`, open Room Requests, click Approve.
   * Verify Room A-101 occupancy changes from 0 to 1, status updates, and student dashboard displays allotment.
3. **Room Vacating**:
   * As the student, click "Vacate Hostel Room" on My Room page.
   * Confirm vacancy increases and bed becomes available again immediately.
4. **Maintenance Complaint**:
   * Student files an electrical ticket -> Admin marks "In Progress" with note -> Student sees updated status.
5. **Mess & Feedback**:
   * Admin publishes menu -> Student rates lunch 5 stars -> Admin analytics reflects updated averages.
6. **Mess Billing (Stretch Goal)**:
   * Admin generates bills for current month -> Student checks "Bills" tab and views calculated charges.
