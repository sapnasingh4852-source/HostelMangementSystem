const User = require('../models/User');
const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');
const RoomRequest = require('../models/RoomRequest');
const RoomAllotment = require('../models/RoomAllotment');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MessMenu = require('../models/MessMenu');

const getDashboard = async (req, res) => {
  try {
    const studentId = req.session.userId;

    // 1. Current Active Allotment
    const activeAllotment = await RoomAllotment.findOne({
      student: studentId,
      status: 'Active',
    })
      .populate('room')
      .populate('block');

    // 2. Pending Room Request
    const pendingRoomRequest = await RoomRequest.findOne({
      student: studentId,
      status: 'Pending',
    })
      .populate('preferredBlock')
      .populate('preferredRoom');

    // 3. Pending Room Change Request
    const pendingChangeRequest = await RoomChangeRequest.findOne({
      student: studentId,
      status: 'Pending',
    })
      .populate('currentRoom')
      .populate('preferredRoom');

    // 4. Maintenance Requests count & recent
    const maintenanceRequests = await MaintenanceRequest.find({
      student: studentId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const activeMaintenanceCount = await MaintenanceRequest.countDocuments({
      student: studentId,
      status: { $in: ['Pending', 'In Progress'] },
    });

    // 5. Today's Mess Menu
    const now = new Date();
    const publishedMenu = await MessMenu.findOne({
      status: 'Published',
      weekStartDate: { $lte: now },
      weekEndDate: { $gte: now },
    }) || await MessMenu.findOne({ status: 'Published' }).sort({ weekStartDate: -1 });

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayName = days[now.getDay()];
    let todayMeals = null;

    if (publishedMenu && publishedMenu.menu && publishedMenu.menu[currentDayName]) {
      todayMeals = publishedMenu.menu[currentDayName];
    }

    res.render('student/dashboard', {
      pageTitle: 'Student Dashboard - Hostel System',
      path: '/student/dashboard',
      activeAllotment,
      pendingRoomRequest,
      pendingChangeRequest,
      maintenanceRequests,
      activeMaintenanceCount,
      todayMeals,
      currentDayName: currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1),
    });
  } catch (error) {
    console.error('Student Dashboard Error:', error);
    req.flash('error_msg', 'Failed to load dashboard.');
    res.redirect('/login');
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('student/profile', {
      pageTitle: 'My Profile - Hostel System',
      path: '/student/profile',
      user,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    req.flash('error_msg', 'Failed to load profile.');
    res.redirect('/student/dashboard');
  }
};

const postProfile = async (req, res) => {
  try {
    const { name, phone, department, year, gender } = req.body;
    await User.findByIdAndUpdate(req.session.userId, {
      name,
      phone,
      department,
      year,
      gender,
    });

    req.session.userName = name;
    req.flash('success_msg', 'Profile updated successfully.');
    res.redirect('/student/profile');
  } catch (error) {
    console.error('Update Profile Error:', error);
    req.flash('error_msg', 'Failed to update profile: ' + error.message);
    res.redirect('/student/profile');
  }
};

const getRooms = async (req, res) => {
  try {
    const { block, roomType, floor, facility } = req.query;
    const filter = { status: { $ne: 'Inactive' } };

    if (block) filter.block = block;
    if (roomType) filter.roomType = roomType;
    if (floor !== undefined && floor !== '') filter.floor = Number(floor);
    if (facility) filter.facilities = { $in: [facility] };

    const blocks = await HostelBlock.find({ status: 'Active' });
    const rooms = await Room.find(filter).populate('block').sort({ block: 1, roomNumber: 1 });

    const activeAllotment = await RoomAllotment.findOne({
      student: req.session.userId,
      status: 'Active',
    });

    const pendingRequest = await RoomRequest.findOne({
      student: req.session.userId,
      status: 'Pending',
    });

    res.render('student/rooms', {
      pageTitle: 'Explore Available Rooms',
      path: '/student/rooms',
      rooms,
      blocks,
      query: req.query,
      hasActiveAllotment: !!activeAllotment,
      hasPendingRequest: !!pendingRequest,
    });
  } catch (error) {
    console.error('Browse Rooms Error:', error);
    req.flash('error_msg', 'Failed to load rooms list.');
    res.redirect('/student/dashboard');
  }
};

const getMyRoom = async (req, res) => {
  try {
    const allotment = await RoomAllotment.findOne({
      student: req.session.userId,
      status: 'Active',
    })
      .populate('room')
      .populate('block');

    let roommates = [];
    if (allotment && allotment.room) {
      roommates = await RoomAllotment.find({
        room: allotment.room._id,
        status: 'Active',
        student: { $ne: req.session.userId },
      }).populate('student', 'name email phone studentId department year');
    }

    const pendingChangeRequest = await RoomChangeRequest.findOne({
      student: req.session.userId,
      status: 'Pending',
    }).populate('preferredRoom preferredBlock');

    res.render('student/my-room', {
      pageTitle: 'My Room Allotment',
      path: '/student/my-room',
      allotment,
      roommates,
      pendingChangeRequest,
    });
  } catch (error) {
    console.error('My Room Error:', error);
    req.flash('error_msg', 'Failed to load your room details.');
    res.redirect('/student/dashboard');
  }
};

const postVacateRoom = async (req, res) => {
  try {
    const studentId = req.session.userId;
    const allotment = await RoomAllotment.findOne({
      student: studentId,
      status: 'Active',
    });

    if (!allotment) {
      req.flash('error_msg', 'You do not have an active room allotment to vacate.');
      return res.redirect('/student/my-room');
    }

    // Atomic update on room occupancy
    const roomId = allotment.room;
    await Room.findByIdAndUpdate(roomId, [
      {
        $set: {
          currentOccupancy: {
            $max: [0, { $subtract: ['$currentOccupancy', 1] }],
          },
          status: 'Available',
        },
      },
    ]);

    allotment.status = 'Vacated';
    allotment.vacatedAt = new Date();
    await allotment.save();

    req.flash('success_msg', 'You have successfully vacated your room. The bed is now available for other students.');
    res.redirect('/student/dashboard');
  } catch (error) {
    console.error('Vacate Room Error:', error);
    req.flash('error_msg', 'Failed to vacate room: ' + error.message);
    res.redirect('/student/my-room');
  }
};

const getRequestsList = async (req, res) => {
  try {
    const studentId = req.session.userId;

    const roomRequests = await RoomRequest.find({ student: studentId })
      .populate('preferredBlock')
      .populate('preferredRoom')
      .sort({ createdAt: -1 });

    const changeRequests = await RoomChangeRequest.find({ student: studentId })
      .populate('currentRoom')
      .populate('preferredRoom')
      .populate('preferredBlock')
      .sort({ createdAt: -1 });

    res.render('student/requests-list', {
      pageTitle: 'My Requests History',
      path: '/student/requests',
      roomRequests,
      changeRequests,
    });
  } catch (error) {
    console.error('Get Requests List Error:', error);
    req.flash('error_msg', 'Failed to load requests list.');
    res.redirect('/student/dashboard');
  }
};

module.exports = {
  getDashboard,
  getProfile,
  postProfile,
  getRooms,
  getMyRoom,
  postVacateRoom,
  getRequestsList,
};
