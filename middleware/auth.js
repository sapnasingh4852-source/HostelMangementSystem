// Authentication & Role-Based Access Control Middlewares

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error_msg', 'Please log in to access this page.');
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
};

const isStudent = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    req.flash('error_msg', 'Please log in to access this page.');
    return res.redirect('/login');
  }
  if (req.session.role === 'student') {
    return next();
  }
  req.flash('error_msg', 'Access denied. This section is for students only.');
  return res.redirect('/admin/dashboard');
};

const isAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    req.flash('error_msg', 'Please log in as an administrator.');
    return res.redirect('/login');
  }
  if (req.session.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Access denied. Administrative privileges required.');
  return res.redirect('/student/dashboard');
};

const guestOnly = (req, res, next) => {
  if (req.session && req.session.userId) {
    if (req.session.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/student/dashboard');
  }
  return next();
};

module.exports = {
  isAuthenticated,
  isStudent,
  isAdmin,
  guestOnly,
};
