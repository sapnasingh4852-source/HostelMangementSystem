const User = require('../models/User');

const getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Login - Hostel Management System',
    path: '/login',
  });
};

const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    if (!user.isActive) {
      req.flash('error_msg', 'Your account has been deactivated. Please contact the hostel administration.');
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // Set session details
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    req.flash('success_msg', `Welcome back, ${user.name}!`);

    const returnUrl = req.session.returnTo;
    delete req.session.returnTo;

    if (returnUrl) {
      return res.redirect(returnUrl);
    }

    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/student/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'An error occurred during login. Please try again.');
    res.redirect('/login');
  }
};

const getRegister = (req, res) => {
  res.render('auth/register', {
    pageTitle: 'Student Registration - Hostel Management System',
    path: '/register',
  });
};

const postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, studentId, phone, gender, department, year } = req.body;

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/register');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      req.flash('error_msg', 'An account with this email address already exists.');
      return res.redirect('/register');
    }

    if (studentId) {
      const existingStudentId = await User.findOne({ studentId });
      if (existingStudentId) {
        req.flash('error_msg', 'A student with this Student ID is already registered.');
        return res.redirect('/register');
      }
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
      studentId: studentId || `STU-${Date.now().toString().slice(-6)}`,
      phone,
      gender: gender || 'Male',
      department: department || 'General Engineering',
      year: year || '1st Year',
    });

    await newUser.save();

    req.flash('success_msg', 'Registration successful! You can now log in with your credentials.');
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error_msg', 'Failed to register account: ' + error.message);
    res.redirect('/register');
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
};

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout,
};
