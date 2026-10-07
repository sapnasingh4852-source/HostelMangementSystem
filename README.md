# 🏠 Hostel Management System

A full-stack web platform for colleges and universities to run their hostels — residential blocks, room capacities, student allotments, maintenance complaint ticketing, room-change transfers, weekly mess dining menus, meal quality feedback, and monthly catering bills. Built with an admin dashboard and concurrency-safe allotment logic.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)

## ✨ Features

- 🏢 Residential block & room capacity management
- 🛏️ Student room allotment with atomic, concurrency-safe booking
- 🛠️ Maintenance complaint ticketing
- 🔁 Room-change / transfer requests
- 🍽️ Weekly mess dining menu management
- ⭐ Meal quality feedback from students
- 🧾 Monthly catering bill generation
- 🔐 Session-based authentication with role separation (admin dashboards)

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Templating | EJS |
| Auth | express-session + bcryptjs |
| Validation | express-validator |

## 📁 Project Structure

```text
├── config/          # Database & app configuration
├── controllers/     # Route business logic
├── middleware/      # Auth & request middleware
├── models/          # Mongoose models
├── public/          # Static assets (CSS/JS/images)
├── routes/          # Express routers
├── seeds/           # Database seed scripts
├── tests/           # Test files
├── utils/           # Helper utilities
├── views/           # EJS templates
├── .env.example     # Environment variable template
└── app.js           # Application entry point
```

## 🚀 Getting Started

**Prerequisites:** Node.js 18+, a MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas)).

```bash
# 1. Clone the repository
git clone https://github.com/sapnasingh4852-source/HostelMangementSystem.git
cd HostelMangementSystem

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in the values (see table below)

# 4. (Optional) Seed the database with sample data
npm run seed

# 5. Start the development server
npm run dev
```

Then open `http://localhost:<PORT>` in your browser.

## 🔑 Environment Variables

Copy `.env.example` → `.env` and set:

| Variable | Description |
| --- | --- |
| `PORT` | Port the server listens on |
| `MONGODB_URI` | MongoDB connection string |
| `SESSION_SECRET` | Secret used to sign session cookies |
| `NODE_ENV` | `development` or `production` |

## 📜 Available Scripts

| Script | Command | Description |
| --- | --- | --- |
| `npm run dev` | `nodemon` | Start dev server with auto-reload |
| `npm start` | `node` | Start production server |
| `npm run seed` | `node seeds/...` | Populate the database with sample data |

---

Built as a full-stack learning project by [Sapna Singh](https://github.com/sapnasingh4852-source).
