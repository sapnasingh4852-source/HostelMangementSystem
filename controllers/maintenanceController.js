const MaintenanceRequest = require('../models/MaintenanceRequest');
const RoomAllotment = require('../models/RoomAllotment');
const HostelBlock = require('../models/HostelBlock');

// --- STUDENT ACTIONS ---

const getStudentMaintenance = async (req, res) => {
  try {
    const studentId = req.session.userId;
    const requests = await MaintenanceRequest.find({ student: studentId })
      .populate('room')
      .populate('block')
      .sort({ createdAt: -1 });

    const activeAllotment = await RoomAllotment.findOne({
      student: studentId,
      status: 'Active',
    });

    res.render('student/maintenance', {
      pageTitle: 'Maintenance Complaints',
      path: '/student/maintenance',
      requests,
      hasActiveAllotment: !!activeAllotment,
    });
  } catch (error) {
    console.error('Get Student Maintenance Error:', error);
    req.flash('error_msg', 'Failed to load maintenance requests.');
    res.redirect('/student/dashboard');
  }
};

const postStudentMaintenance = async (req, res) => {
  try {
    const studentId = req.session.userId;
    const { category, title, description, priority } = req.body;

    const allotment = await RoomAllotment.findOne({
      student: studentId,
      status: 'Active',
    });

    if (!allotment) {
      req.flash('error_msg', 'You must have an active room allotment to raise a maintenance request.');
      return res.redirect('/student/maintenance');
    }

    const complaint = new MaintenanceRequest({
      student: studentId,
      room: allotment.room,
      block: allotment.block,
      category,
      title,
      description,
      priority: priority || 'Medium',
      status: 'Pending',
    });

    await complaint.save();

    req.flash('success_msg', 'Maintenance complaint submitted successfully. The maintenance team has been notified.');
    res.redirect('/student/maintenance');
  } catch (error) {
    console.error('Post Maintenance Error:', error);
    req.flash('error_msg', 'Failed to submit maintenance request: ' + error.message);
    res.redirect('/student/maintenance');
  }
};

// --- ADMIN ACTIONS ---

const getAdminMaintenance = async (req, res) => {
  try {
    const { status, priority, category, block } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (block) filter.block = block;

    const requests = await MaintenanceRequest.find(filter)
      .populate('student', 'name email phone studentId')
      .populate('room')
      .populate('block')
      .sort({ createdAt: -1 });

    const blocks = await HostelBlock.find();

    res.render('admin/maintenance/index', {
      pageTitle: 'Maintenance Complaints Management',
      path: '/admin/maintenance',
      requests,
      blocks,
      query: req.query,
    });
  } catch (error) {
    console.error('Get Admin Maintenance Error:', error);
    req.flash('error_msg', 'Failed to load maintenance requests.');
    res.redirect('/admin/dashboard');
  }
};

const postAdminMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    const complaint = await MaintenanceRequest.findById(id);
    if (!complaint) {
      req.flash('error_msg', 'Maintenance request not found.');
      return res.redirect('/admin/maintenance');
    }

    complaint.status = status;
    if (adminRemarks) {
      complaint.adminRemarks = adminRemarks;
    }
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    req.flash('success_msg', `Maintenance request status updated to "${status}".`);
    res.redirect('/admin/maintenance');
  } catch (error) {
    console.error('Update Maintenance Status Error:', error);
    req.flash('error_msg', 'Failed to update request status: ' + error.message);
    res.redirect('/admin/maintenance');
  }
};

module.exports = {
  getStudentMaintenance,
  postStudentMaintenance,
  getAdminMaintenance,
  postAdminMaintenanceStatus,
};
