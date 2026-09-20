const express = require('express');
const router = express.Router();
const { isStudent } = require('../middleware/auth');
const studentController = require('../controllers/studentController');
const allotmentController = require('../controllers/allotmentController');
const maintenanceController = require('../controllers/maintenanceController');
const messController = require('../controllers/messController');
const feedbackController = require('../controllers/feedbackController');
const billController = require('../controllers/billController');
const {
  maintenanceValidation,
  feedbackValidation,
  handleValidationErrors,
} = require('../middleware/validation');

// Apply isStudent protection to all routes in this file
router.use(isStudent);

// Dashboard & Profile
router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.post('/profile', studentController.postProfile);

// Rooms & Allotment
router.get('/rooms', studentController.getRooms);
router.get('/my-room', studentController.getMyRoom);
router.post('/vacate', studentController.postVacateRoom);
router.get('/requests', studentController.getRequestsList);

// Room Request
router.get('/room-request', allotmentController.getRoomRequestForm);
router.post('/room-request', allotmentController.postRoomRequest);

// Room Change Request
router.get('/room-change', allotmentController.getRoomChangeForm);
router.post('/room-change', allotmentController.postRoomChangeRequest);

// Maintenance Complaints
router.get('/maintenance', maintenanceController.getStudentMaintenance);
router.post(
  '/maintenance',
  maintenanceValidation,
  handleValidationErrors('/student/maintenance'),
  maintenanceController.postStudentMaintenance
);

// Mess & Food Feedback
router.get('/mess-menu', messController.getStudentMessMenu);
router.get('/feedback', feedbackController.getStudentFeedback);
router.post(
  '/feedback',
  feedbackValidation,
  handleValidationErrors('/student/feedback'),
  feedbackController.postStudentFeedback
);

// Mess Bills (Stretch Goal)
router.get('/bills', billController.getStudentBills);

module.exports = router;
