const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { guestOnly, isAuthenticated } = require('../middleware/auth');
const {
  loginValidation,
  registerValidation,
  handleValidationErrors,
} = require('../middleware/validation');

router.get('/login', guestOnly, authController.getLogin);
router.post(
  '/login',
  guestOnly,
  loginValidation,
  handleValidationErrors('/login'),
  authController.postLogin
);

router.get('/register', guestOnly, authController.getRegister);
router.post(
  '/register',
  guestOnly,
  registerValidation,
  handleValidationErrors('/register'),
  authController.postRegister
);

router.post('/logout', isAuthenticated, authController.logout);
router.get('/logout', isAuthenticated, authController.logout);

module.exports = router;
