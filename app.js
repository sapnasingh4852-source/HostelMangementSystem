require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const morgan = require('morgan');

const connectDB = require('./config/db');
const helpers = require('./utils/helpers');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const blockRoutes = require('./routes/blockRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messRoutes = require('./routes/messRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_db';

// Connect to Database
connectDB();

// Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method Override for PUT & DELETE support in HTML forms
app.use(methodOverride('_method'));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
const sessionStore = MongoStore.create({
  mongoUrl: mongoUri,
  collectionName: 'sessions',
  ttl: 14 * 24 * 60 * 60, // 14 days
  autoRemove: 'native',
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hostel_system_secure_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

// Flash messages
app.use(flash());

// Global locals middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId
    ? {
        id: req.session.userId,
        role: req.session.role,
        name: req.session.userName,
        email: req.session.userEmail,
      }
    : null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.info_msg = req.flash('info_msg');
  res.locals.helpers = helpers;
  res.locals.currentPath = req.path;
  next();
});

// Landing Page
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    if (req.session.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/student/dashboard');
  }
  res.render('public/index', {
    pageTitle: 'Hostel Room Allotment & Mess Management System',
    path: '/',
  });
});

// Mount Routes
app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin/blocks', blockRoutes);
app.use('/admin/rooms', roomRoutes);
app.use('/admin/mess', messRoutes);
app.use('/admin', adminRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Hostel Room Allotment & Mess Management System`);
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
