const Room = require('../models/Room');
const HostelBlock = require('../models/HostelBlock');
const RoomAllotment = require('../models/RoomAllotment');

const getRooms = async (req, res) => {
  try {
    const { block, roomType, floor, status } = req.query;
    const filter = {};

    if (block) filter.block = block;
    if (roomType) filter.roomType = roomType;
    if (floor !== undefined && floor !== '') filter.floor = Number(floor);
    if (status) filter.status = status;

    const rooms = await Room.find(filter)
      .populate('block')
      .sort({ block: 1, roomNumber: 1 });

    const blocks = await HostelBlock.find();

    res.render('admin/rooms/index', {
      pageTitle: 'Rooms Management',
      path: '/admin/rooms',
      rooms,
      blocks,
      query: req.query,
    });
  } catch (error) {
    console.error('Get Admin Rooms Error:', error);
    req.flash('error_msg', 'Failed to load rooms.');
    res.redirect('/admin/dashboard');
  }
};

const getRoomNew = async (req, res) => {
  try {
    const blocks = await HostelBlock.find({ status: 'Active' });
    res.render('admin/rooms/form', {
      pageTitle: 'Add New Room',
      path: '/admin/rooms',
      room: { facilities: ['Wi-Fi', 'Study Table', 'Cupboard', 'Fan'] },
      blocks,
      isEditing: false,
    });
  } catch (error) {
    console.error('Get Room New Error:', error);
    req.flash('error_msg', 'Failed to load room form.');
    res.redirect('/admin/rooms');
  }
};

const postRoom = async (req, res) => {
  try {
    const { block, roomNumber, floor, roomType, capacity, monthlyFee, facilities, status } = req.body;

    const existingRoom = await Room.findOne({ block, roomNumber: roomNumber.trim() });
    if (existingRoom) {
      req.flash('error_msg', `Room number ${roomNumber} already exists in the selected hostel block.`);
      return res.redirect('/admin/rooms/new');
    }

    const roomFacilities = Array.isArray(facilities)
      ? facilities
      : facilities
      ? [facilities]
      : [];

    const room = new Room({
      block,
      roomNumber: roomNumber.trim(),
      floor: Number(floor),
      roomType,
      capacity: Number(capacity),
      currentOccupancy: 0,
      monthlyFee: Number(monthlyFee) || 0,
      facilities: roomFacilities,
      status: status || 'Available',
    });

    await room.save();

    req.flash('success_msg', `Room ${room.roomNumber} created successfully.`);
    res.redirect('/admin/rooms');
  } catch (error) {
    console.error('Create Room Error:', error);
    req.flash('error_msg', 'Failed to create room: ' + error.message);
    res.redirect('/admin/rooms/new');
  }
};

const getRoomEdit = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('block');
    if (!room) {
      req.flash('error_msg', 'Room not found.');
      return res.redirect('/admin/rooms');
    }

    const blocks = await HostelBlock.find();
    res.render('admin/rooms/form', {
      pageTitle: `Edit Room: ${room.roomNumber}`,
      path: '/admin/rooms',
      room,
      blocks,
      isEditing: true,
    });
  } catch (error) {
    console.error('Get Room Edit Error:', error);
    req.flash('error_msg', 'Failed to retrieve room.');
    res.redirect('/admin/rooms');
  }
};

const putRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { block, roomNumber, floor, roomType, capacity, monthlyFee, facilities, status } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      req.flash('error_msg', 'Room not found.');
      return res.redirect('/admin/rooms');
    }

    // Capacity validation against current occupancy
    const newCapacity = Number(capacity);
    if (newCapacity < room.currentOccupancy) {
      req.flash('error_msg', `Cannot set capacity to ${newCapacity}. There are currently ${room.currentOccupancy} students allotted to this room.`);
      return res.redirect(`/admin/rooms/${id}/edit`);
    }

    // Duplicate check
    const duplicate = await Room.findOne({
      _id: { $ne: id },
      block,
      roomNumber: roomNumber.trim(),
    });
    if (duplicate) {
      req.flash('error_msg', `Another room with number ${roomNumber} already exists in this block.`);
      return res.redirect(`/admin/rooms/${id}/edit`);
    }

    const roomFacilities = Array.isArray(facilities)
      ? facilities
      : facilities
      ? [facilities]
      : [];

    room.block = block;
    room.roomNumber = roomNumber.trim();
    room.floor = Number(floor);
    room.roomType = roomType;
    room.capacity = newCapacity;
    room.monthlyFee = Number(monthlyFee) || 0;
    room.facilities = roomFacilities;
    room.status = status;

    await room.save();

    req.flash('success_msg', `Room ${room.roomNumber} updated successfully.`);
    res.redirect('/admin/rooms');
  } catch (error) {
    console.error('Update Room Error:', error);
    req.flash('error_msg', 'Failed to update room: ' + error.message);
    res.redirect(`/admin/rooms/${req.params.id}/edit`);
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      req.flash('error_msg', 'Room not found.');
      return res.redirect('/admin/rooms');
    }

    // Check if room has active occupants or active allotments
    if (room.currentOccupancy > 0) {
      req.flash('error_msg', `Cannot delete room ${room.roomNumber}. There are ${room.currentOccupancy} student(s) currently allotted to it. Vacate them first.`);
      return res.redirect('/admin/rooms');
    }

    const activeAllotments = await RoomAllotment.countDocuments({
      room: id,
      status: 'Active',
    });
    if (activeAllotments > 0) {
      req.flash('error_msg', 'This room cannot be deleted because active student allotments are assigned to it.');
      return res.redirect('/admin/rooms');
    }

    await Room.findByIdAndDelete(id);

    req.flash('success_msg', `Room ${room.roomNumber} deleted successfully.`);
    res.redirect('/admin/rooms');
  } catch (error) {
    console.error('Delete Room Error:', error);
    req.flash('error_msg', 'Failed to delete room: ' + error.message);
    res.redirect('/admin/rooms');
  }
};

module.exports = {
  getRooms,
  getRoomNew,
  postRoom,
  getRoomEdit,
  putRoom,
  deleteRoom,
};
