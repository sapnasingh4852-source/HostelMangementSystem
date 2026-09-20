const Room = require('../models/Room');
const HostelBlock = require('../models/HostelBlock');
const RoomRequest = require('../models/RoomRequest');
const RoomAllotment = require('../models/RoomAllotment');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const User = require('../models/User');

// --- STUDENT ACTIONS ---

const getRoomRequestForm = async (req, res) => {
  try {
    const studentId = req.session.userId;

    // Check if student already has an active allotment
    const activeAllotment = await RoomAllotment.findOne({
      student: studentId,
      status: 'Active',
    });
    if (activeAllotment) {
      req.flash('error_msg', 'You already have an active room allotment. You cannot request a new room.');
      return res.redirect('/student/my-room');
    }

    // Check if student already has a pending request
    const pendingRequest = await RoomRequest.findOne({
      student: studentId,
      status: 'Pending',
    });
    if (pendingRequest) {
      req.flash('info_msg', 'You already have a pending room request waiting for admin approval.');
      return res.redirect('/student/requests');
    }

    const { roomId } = req.query;
    let preselectedRoom = null;
    if (roomId) {
      preselectedRoom = await Room.findById(roomId).populate('block');
    }

    const blocks = await HostelBlock.find({ status: 'Active' });
    const availableRooms = await Room.find({
      status: 'Available',
      $expr: { $lt: ['$currentOccupancy', '$capacity'] },
    }).populate('block');

    res.render('student/room-request', {
      pageTitle: 'Submit Room Request',
      path: '/student/room-request',
      blocks,
      availableRooms,
      preselectedRoom,
    });
  } catch (error) {
    console.error('Get Room Request Form Error:', error);
    req.flash('error_msg', 'Failed to load room request form.');
    res.redirect('/student/rooms');
  }
};

const postRoomRequest = async (req, res) => {
  try {
    const studentId = req.session.userId;
    const { blockId, roomId, remarks } = req.body;

    // Check for active allotment
    const activeAllotment = await RoomAllotment.findOne({
      student: studentId,
      status: 'Active',
    });
    if (activeAllotment) {
      req.flash('error_msg', 'You already have an active room allotment.');
      return res.redirect('/student/my-room');
    }

    // Check for pending request
    const pendingRequest = await RoomRequest.findOne({
      student: studentId,
      status: 'Pending',
    });
    if (pendingRequest) {
      req.flash('error_msg', 'You already have a pending room request.');
      return res.redirect('/student/requests');
    }

    const targetRoom = await Room.findById(roomId);
    if (!targetRoom) {
      req.flash('error_msg', 'Selected room does not exist.');
      return res.redirect('/student/room-request');
    }

    if (targetRoom.currentOccupancy >= targetRoom.capacity || targetRoom.status !== 'Available') {
      req.flash('error_msg', 'Selected room is full or currently unavailable.');
      return res.redirect('/student/rooms');
    }

    const newRequest = new RoomRequest({
      student: studentId,
      preferredBlock: blockId || targetRoom.block,
      preferredRoom: roomId,
      preferredRoomType: targetRoom.roomType,
      remarks,
      status: 'Pending',
    });

    await newRequest.save();

    req.flash('success_msg', 'Room allotment request submitted successfully! A warden will review it shortly.');
    res.redirect('/student/requests');
  } catch (error) {
    console.error('Post Room Request Error:', error);
    req.flash('error_msg', 'Failed to submit room request: ' + error.message);
    res.redirect('/student/room-request');
  }
};

const getRoomChangeForm = async (req, res) => {
  try {
    const studentId = req.session.userId;

    const activeAllotment = await RoomAllotment.findOne({
      student: studentId,
      status: 'Active',
    }).populate('room block');

    if (!activeAllotment) {
      req.flash('error_msg', 'You must have an active room allotment before requesting a room change.');
      return res.redirect('/student/rooms');
    }

    const pendingChange = await RoomChangeRequest.findOne({
      student: studentId,
      status: 'Pending',
    });
    if (pendingChange) {
      req.flash('info_msg', 'You already have a room change request pending review.');
      return res.redirect('/student/requests');
    }

    const availableRooms = await Room.find({
      _id: { $ne: activeAllotment.room._id },
      status: 'Available',
      $expr: { $lt: ['$currentOccupancy', '$capacity'] },
    }).populate('block');

    const blocks = await HostelBlock.find({ status: 'Active' });

    res.render('student/room-change', {
      pageTitle: 'Request Room Change',
      path: '/student/room-change',
      activeAllotment,
      availableRooms,
      blocks,
    });
  } catch (error) {
    console.error('Get Room Change Form Error:', error);
    req.flash('error_msg', 'Failed to load room change form.');
    res.redirect('/student/my-room');
  }
};

const postRoomChangeRequest = async (req, res) => {
  try {
    const studentId = req.session.userId;
    const { preferredRoomId, reason } = req.body;

    const activeAllotment = await RoomAllotment.findOne({
      student: studentId,
      status: 'Active',
    });

    if (!activeAllotment) {
      req.flash('error_msg', 'You do not have an active allotment to change.');
      return res.redirect('/student/rooms');
    }

    const pendingChange = await RoomChangeRequest.findOne({
      student: studentId,
      status: 'Pending',
    });
    if (pendingChange) {
      req.flash('error_msg', 'You already have a pending room change request.');
      return res.redirect('/student/requests');
    }

    const targetRoom = await Room.findById(preferredRoomId);
    if (!targetRoom) {
      req.flash('error_msg', 'Selected target room not found.');
      return res.redirect('/student/room-change');
    }

    if (targetRoom._id.toString() === activeAllotment.room.toString()) {
      req.flash('error_msg', 'Preferred room cannot be your current room.');
      return res.redirect('/student/room-change');
    }

    if (targetRoom.currentOccupancy >= targetRoom.capacity || targetRoom.status !== 'Available') {
      req.flash('error_msg', 'The requested room is already full or unavailable.');
      return res.redirect('/student/room-change');
    }

    const changeRequest = new RoomChangeRequest({
      student: studentId,
      currentRoom: activeAllotment.room,
      currentBlock: activeAllotment.block,
      preferredBlock: targetRoom.block,
      preferredRoom: targetRoom._id,
      preferredRoomType: targetRoom.roomType,
      reason,
      status: 'Pending',
    });

    await changeRequest.save();

    req.flash('success_msg', 'Room change request submitted successfully. Awaiting warden approval.');
    res.redirect('/student/requests');
  } catch (error) {
    console.error('Post Room Change Request Error:', error);
    req.flash('error_msg', 'Failed to submit room change request: ' + error.message);
    res.redirect('/student/room-change');
  }
};

// --- ADMIN ACTIONS ---

const getAdminRoomRequests = async (req, res) => {
  try {
    const { status, block } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (block) filter.preferredBlock = block;

    const requests = await RoomRequest.find(filter)
      .populate('student', 'name email studentId phone department year')
      .populate('preferredBlock')
      .populate('preferredRoom')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    const blocks = await HostelBlock.find();

    res.render('admin/requests/room-requests', {
      pageTitle: 'Manage Room Allotment Requests',
      path: '/admin/room-requests',
      requests,
      blocks,
      query: req.query,
    });
  } catch (error) {
    console.error('Get Admin Room Requests Error:', error);
    req.flash('error_msg', 'Failed to load room requests.');
    res.redirect('/admin/dashboard');
  }
};

const postApproveRoomRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;
    const adminId = req.session.userId;

    const request = await RoomRequest.findById(id);
    if (!request || request.status !== 'Pending') {
      req.flash('error_msg', 'Request not found or already processed.');
      return res.redirect('/admin/room-requests');
    }

    // Check if student already has active allotment
    const existingActive = await RoomAllotment.findOne({
      student: request.student,
      status: 'Active',
    });
    if (existingActive) {
      request.status = 'Rejected';
      request.adminRemarks = 'Student already holds an active room allotment.';
      request.reviewedBy = adminId;
      request.reviewedAt = new Date();
      await request.save();

      req.flash('error_msg', 'Student already has an active room allotment. Request marked as Rejected.');
      return res.redirect('/admin/room-requests');
    }

    // Atomic room check and occupancy increment
    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: request.preferredRoom,
        status: 'Available',
        $expr: { $lt: ['$currentOccupancy', '$capacity'] },
      },
      {
        $inc: { currentOccupancy: 1 },
      },
      { new: true }
    );

    if (!updatedRoom) {
      req.flash('error_msg', 'This room became full or unavailable before allotment could be finalized.');
      return res.redirect('/admin/room-requests');
    }

    // Check if room has reached full capacity
    if (updatedRoom.currentOccupancy >= updatedRoom.capacity) {
      updatedRoom.status = 'Full';
      await updatedRoom.save();
    }

    // Create active allotment record
    const allotment = new RoomAllotment({
      student: request.student,
      room: updatedRoom._id,
      block: updatedRoom.block,
      startDate: new Date(),
      status: 'Active',
    });
    await allotment.save();

    // Mark request Approved
    request.status = 'Approved';
    request.adminRemarks = adminRemarks || 'Room request approved by warden.';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    req.flash('success_msg', `Room ${updatedRoom.roomNumber} successfully allotted to the student.`);
    res.redirect('/admin/room-requests');
  } catch (error) {
    console.error('Approve Room Request Error:', error);
    req.flash('error_msg', 'Failed to approve room request: ' + error.message);
    res.redirect('/admin/room-requests');
  }
};

const postRejectRoomRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;
    const adminId = req.session.userId;

    const request = await RoomRequest.findById(id);
    if (!request || request.status !== 'Pending') {
      req.flash('error_msg', 'Request not found or already processed.');
      return res.redirect('/admin/room-requests');
    }

    request.status = 'Rejected';
    request.adminRemarks = adminRemarks || 'Request rejected by administration.';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    req.flash('success_msg', 'Room request rejected.');
    res.redirect('/admin/room-requests');
  } catch (error) {
    console.error('Reject Room Request Error:', error);
    req.flash('error_msg', 'Failed to reject room request: ' + error.message);
    res.redirect('/admin/room-requests');
  }
};

const getAdminChangeRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await RoomChangeRequest.find(filter)
      .populate('student', 'name email studentId phone department year')
      .populate('currentRoom')
      .populate('currentBlock')
      .populate('preferredRoom')
      .populate('preferredBlock')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.render('admin/requests/change-requests', {
      pageTitle: 'Manage Room Change Requests',
      path: '/admin/room-change-requests',
      requests,
      query: req.query,
    });
  } catch (error) {
    console.error('Get Admin Change Requests Error:', error);
    req.flash('error_msg', 'Failed to load change requests.');
    res.redirect('/admin/dashboard');
  }
};

const postApproveChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;
    const adminId = req.session.userId;

    const changeReq = await RoomChangeRequest.findById(id);
    if (!changeReq || changeReq.status !== 'Pending') {
      req.flash('error_msg', 'Room change request not found or already resolved.');
      return res.redirect('/admin/room-change-requests');
    }

    // Find student's active allotment
    const currentAllotment = await RoomAllotment.findOne({
      student: changeReq.student,
      status: 'Active',
    });

    if (!currentAllotment) {
      changeReq.status = 'Rejected';
      changeReq.adminRemarks = 'Student has no active allotment to change.';
      changeReq.reviewedBy = adminId;
      changeReq.reviewedAt = new Date();
      await changeReq.save();

      req.flash('error_msg', 'Student has no active allotment. Change request rejected.');
      return res.redirect('/admin/room-change-requests');
    }

    // Step 1: Atomic increment on preferred room
    const targetRoom = await Room.findOneAndUpdate(
      {
        _id: changeReq.preferredRoom,
        status: 'Available',
        $expr: { $lt: ['$currentOccupancy', '$capacity'] },
      },
      {
        $inc: { currentOccupancy: 1 },
      },
      { new: true }
    );

    if (!targetRoom) {
      req.flash('error_msg', 'The preferred room has become full or unavailable.');
      return res.redirect('/admin/room-change-requests');
    }

    if (targetRoom.currentOccupancy >= targetRoom.capacity) {
      targetRoom.status = 'Full';
      await targetRoom.save();
    }

    // Step 2: Atomic decrement on old room
    await Room.findByIdAndUpdate(changeReq.currentRoom, [
      {
        $set: {
          currentOccupancy: {
            $max: [0, { $subtract: ['$currentOccupancy', 1] }],
          },
          status: 'Available',
        },
      },
    ]);

    // Step 3: Close old allotment
    currentAllotment.status = 'Vacated';
    currentAllotment.vacatedAt = new Date();
    await currentAllotment.save();

    // Step 4: Create new active allotment
    const newAllotment = new RoomAllotment({
      student: changeReq.student,
      room: targetRoom._id,
      block: targetRoom.block,
      startDate: new Date(),
      status: 'Active',
    });
    await newAllotment.save();

    // Step 5: Mark change request Approved
    changeReq.status = 'Approved';
    changeReq.adminRemarks = adminRemarks || 'Room change approved by warden.';
    changeReq.reviewedBy = adminId;
    changeReq.reviewedAt = new Date();
    await changeReq.save();

    req.flash('success_msg', `Room change successfully executed to Room ${targetRoom.roomNumber}.`);
    res.redirect('/admin/room-change-requests');
  } catch (error) {
    console.error('Approve Change Request Error:', error);
    req.flash('error_msg', 'Failed to approve room change: ' + error.message);
    res.redirect('/admin/room-change-requests');
  }
};

const postRejectChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;
    const adminId = req.session.userId;

    const changeReq = await RoomChangeRequest.findById(id);
    if (!changeReq || changeReq.status !== 'Pending') {
      req.flash('error_msg', 'Request not found or already processed.');
      return res.redirect('/admin/room-change-requests');
    }

    changeReq.status = 'Rejected';
    changeReq.adminRemarks = adminRemarks || 'Room change request rejected by warden.';
    changeReq.reviewedBy = adminId;
    changeReq.reviewedAt = new Date();
    await changeReq.save();

    req.flash('success_msg', 'Room change request rejected.');
    res.redirect('/admin/room-change-requests');
  } catch (error) {
    console.error('Reject Change Request Error:', error);
    req.flash('error_msg', 'Failed to reject room change request: ' + error.message);
    res.redirect('/admin/room-change-requests');
  }
};

const postAdminVacateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const allotment = await RoomAllotment.findOne({
      student: studentId,
      status: 'Active',
    });

    if (!allotment) {
      req.flash('error_msg', 'No active allotment found for this student.');
      return res.redirect('/admin/students');
    }

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

    req.flash('success_msg', 'Student room allotment has been vacated. The bed is now freed.');
    res.redirect(req.header('Referer') || '/admin/students');
  } catch (error) {
    console.error('Admin Vacate Student Error:', error);
    req.flash('error_msg', 'Failed to vacate student: ' + error.message);
    res.redirect('/admin/students');
  }
};

module.exports = {
  getRoomRequestForm,
  postRoomRequest,
  getRoomChangeForm,
  postRoomChangeRequest,
  getAdminRoomRequests,
  postApproveRoomRequest,
  postRejectRoomRequest,
  getAdminChangeRequests,
  postApproveChangeRequest,
  postRejectChangeRequest,
  postAdminVacateStudent,
};
