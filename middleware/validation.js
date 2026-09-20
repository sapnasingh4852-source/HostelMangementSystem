const { body, validationResult } = require('express-validator');

// Helper to check validation results and redirect back with flash errors
const handleValidationErrors = (redirectUrl) => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      req.flash('error_msg', errorMessages.join('. '));
      return res.redirect(redirectUrl || req.header('Referer') || '/');
    }
    next();
  };
};

// Register validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Full Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Invalid role specified'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s]{8,15}$/)
    .withMessage('Please provide a valid phone number'),
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Block validation rules
const blockValidation = [
  body('name').trim().notEmpty().withMessage('Block Name is required'),
  body('code').trim().notEmpty().withMessage('Block Code is required'),
  body('numberOfFloors')
    .isInt({ min: 1 })
    .withMessage('Number of floors must be at least 1'),
];

// Room validation rules
const roomValidation = [
  body('block').notEmpty().withMessage('Hostel block is required'),
  body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
  body('floor').isInt({ min: 0 }).withMessage('Floor must be 0 or higher'),
  body('roomType')
    .isIn(['Single', 'Double', 'Triple', 'Dormitory'])
    .withMessage('Invalid room type'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
];

// Maintenance validation rules
const maintenanceValidation = [
  body('category').notEmpty().withMessage('Complaint category is required'),
  body('title').trim().notEmpty().withMessage('Issue title is required'),
  body('description').trim().notEmpty().withMessage('Issue description is required'),
  body('priority')
    .isIn(['Low', 'Medium', 'High', 'Emergency'])
    .withMessage('Invalid priority selected'),
];

// Feedback validation rules
const feedbackValidation = [
  body('mealType')
    .isIn(['Breakfast', 'Lunch', 'Snacks', 'Dinner'])
    .withMessage('Invalid meal type selected'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  blockValidation,
  roomValidation,
  maintenanceValidation,
  feedbackValidation,
};
