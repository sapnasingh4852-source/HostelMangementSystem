const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const allotmentController = require('../controllers/allotmentController');
const maintenanceController = require('../controllers/maintenanceController');
const feedbackController = require('../controllers/feedbackController');
const billController = require('../controllers/billController');

// Protect all admin routes
router.use(isAdmin);

// Dashboard, Students, Reports
router.get('/dashboard', adminController.getDashboard);
router.get('/students', adminController.getStudents);
router.post('/students/:studentId/vacate', allotmentController.postAdminVacateStudent);
router.get('/reports', adminController.getReports);

// Room Allotment Requests
router.get('/room-requests', allotmentController.getAdminRoomRequests);
router.post('/room-requests/:id/approve', allotmentController.postApproveRoomRequest);
router.post('/room-requests/:id/reject', allotmentController.postRejectRoomRequest);

// Room Change Requests
router.get('/room-change-requests', allotmentController.getAdminChangeRequests);
router.post('/room-change-requests/:id/approve', allotmentController.postApproveChangeRequest);
router.post('/room-change-requests/:id/reject', allotmentController.postRejectChangeRequest);

// Maintenance Requests
router.get('/maintenance', maintenanceController.getAdminMaintenance);
router.post('/maintenance/:id/status', maintenanceController.postAdminMaintenanceStatus);

// Mess Feedback Analytics
router.get('/mess-feedback', feedbackController.getAdminFeedbackDashboard);

// Mess Billing (Stretch Goal)
router.get('/bills', billController.getAdminBills);
router.get('/bills/generate', billController.getAdminGenerateBill);
router.post('/bills/generate', billController.postAdminGenerateBill);
router.post('/bills/:id/status', billController.postUpdateBillStatus);

module.exports = router;
