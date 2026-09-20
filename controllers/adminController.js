const User = require('../models/User');
const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');
const RoomRequest = require('../models/RoomRequest');
const RoomAllotment = require('../models/RoomAllotment');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MealFeedback = require('../models/MealFeedback');

const getDashboard = async (req, res) => {
  try {
    // 1. Basic counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalBlocks = await HostelBlock.countDocuments();
    const rooms = await Room.find().populate('block');
    const totalRooms = rooms.length;

    const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const occupiedBeds = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const occupancyPercentage = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;

    // 2. Pending Requests
    const pendingRoomRequests = await RoomRequest.countDocuments({ status: 'Pending' });
    const pendingChangeRequests = await RoomChangeRequest.countDocuments({ status: 'Pending' });
    const pendingMaintenance = await MaintenanceRequest.countDocuments({ status: { $in: ['Pending', 'In Progress'] } });

    // 3. Block-Wise Occupancy
    const blocks = await HostelBlock.find();
    const blockStats = blocks.map((block) => {
      const blockRooms = rooms.filter((r) => r.block && r.block._id.toString() === block._id.toString());
      const bCapacity = blockRooms.reduce((sum, r) => sum + r.capacity, 0);
      const bOccupied = blockRooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
      const bAvailable = Math.max(0, bCapacity - bOccupied);
      const bPercentage = bCapacity > 0 ? ((bOccupied / bCapacity) * 100).toFixed(1) : 0;
      return {
        _id: block._id,
        name: block.name,
        code: block.code,
        genderRestriction: block.genderRestriction,
        status: block.status,
        totalBeds: bCapacity,
        occupiedBeds: bOccupied,
        availableBeds: bAvailable,
        occupancyPercentage: Number(bPercentage),
      };
    });

    // 4. Recent pending requests for dashboard preview
    const recentRoomRequests = await RoomRequest.find({ status: 'Pending' })
      .populate('student', 'name studentId department')
      .populate('preferredBlock')
      .populate('preferredRoom')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMaintenance = await MaintenanceRequest.find({ status: { $in: ['Pending', 'In Progress'] } })
      .populate('student', 'name studentId')
      .populate('room')
      .populate('block')
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Meal feedback average
    const feedbacks = await MealFeedback.find();
    const avgRating = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 'N/A';

    res.render('admin/dashboard', {
      pageTitle: 'Admin & Warden Dashboard',
      path: '/admin/dashboard',
      stats: {
        totalStudents,
        totalBlocks,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyPercentage,
        pendingRoomRequests,
        pendingChangeRequests,
        pendingMaintenance,
        avgRating,
      },
      blockStats,
      recentRoomRequests,
      recentMaintenance,
      chartData: {
        blockLabels: blockStats.map((b) => b.name),
        blockOccupancies: blockStats.map((b) => b.occupancyPercentage),
        bedBreakdown: [occupiedBeds, availableBeds],
        requestsBreakdown: [pendingRoomRequests, pendingChangeRequests, pendingMaintenance],
      },
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    req.flash('error_msg', 'Failed to load administrator dashboard.');
    res.redirect('/login');
  }
};

const getStudents = async (req, res) => {
  try {
    const { search, department, year } = req.query;
    const filter = { role: 'student' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) filter.department = department;
    if (year) filter.year = year;

    const students = await User.find(filter).sort({ name: 1 });

    // Attach active room allotment for each student
    const studentsWithAllotments = await Promise.all(
      students.map(async (student) => {
        const allotment = await RoomAllotment.findOne({
          student: student._id,
          status: 'Active',
        })
          .populate('room')
          .populate('block');
        return {
          ...student.toObject(),
          activeAllotment: allotment,
        };
      })
    );

    res.render('admin/students', {
      pageTitle: 'Student Directory',
      path: '/admin/students',
      students: studentsWithAllotments,
      query: req.query,
    });
  } catch (error) {
    console.error('Get Students Error:', error);
    req.flash('error_msg', 'Failed to load students directory.');
    res.redirect('/admin/dashboard');
  }
};

const getReports = async (req, res) => {
  try {
    const blocks = await HostelBlock.find();
    const rooms = await Room.find().populate('block');
    const allotments = await RoomAllotment.find({ status: 'Active' })
      .populate('student', 'name studentId email department phone')
      .populate('room')
      .populate('block');

    const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const occupiedBeds = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);

    res.render('admin/reports', {
      pageTitle: 'Hostel System Reports',
      path: '/admin/reports',
      blocks,
      rooms,
      allotments,
      totalBeds,
      occupiedBeds,
      availableBeds,
    });
  } catch (error) {
    console.error('Get Reports Error:', error);
    req.flash('error_msg', 'Failed to generate reports.');
    res.redirect('/admin/dashboard');
  }
};

module.exports = {
  getDashboard,
  getStudents,
  getReports,
};
