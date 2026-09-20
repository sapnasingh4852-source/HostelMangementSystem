const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');

const getBlocks = async (req, res) => {
  try {
    const blocks = await HostelBlock.find().sort({ name: 1 });

    // Attach rooms count and bed statistics for each block
    const blocksWithStats = await Promise.all(
      blocks.map(async (block) => {
        const rooms = await Room.find({ block: block._id });
        const roomCount = rooms.length;
        const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
        const totalOccupancy = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
        return {
          ...block.toObject(),
          roomCount,
          totalCapacity,
          totalOccupancy,
          availableBeds: Math.max(0, totalCapacity - totalOccupancy),
        };
      })
    );

    res.render('admin/blocks/index', {
      pageTitle: 'Hostel Blocks Management',
      path: '/admin/blocks',
      blocks: blocksWithStats,
    });
  } catch (error) {
    console.error('Get Blocks Error:', error);
    req.flash('error_msg', 'Failed to load hostel blocks.');
    res.redirect('/admin/dashboard');
  }
};

const getBlockNew = (req, res) => {
  res.render('admin/blocks/form', {
    pageTitle: 'Add New Hostel Block',
    path: '/admin/blocks',
    block: {},
    isEditing: false,
  });
};

const postBlock = async (req, res) => {
  try {
    const { name, code, description, numberOfFloors, genderRestriction, status } = req.body;

    const existingCode = await HostelBlock.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      req.flash('error_msg', 'A hostel block with this code already exists.');
      return res.redirect('/admin/blocks/new');
    }

    const block = new HostelBlock({
      name,
      code: code.toUpperCase(),
      description,
      numberOfFloors: Number(numberOfFloors),
      genderRestriction,
      status,
    });

    await block.save();

    req.flash('success_msg', `Hostel block "${block.name}" created successfully.`);
    res.redirect('/admin/blocks');
  } catch (error) {
    console.error('Create Block Error:', error);
    req.flash('error_msg', 'Failed to create block: ' + error.message);
    res.redirect('/admin/blocks/new');
  }
};

const getBlockEdit = async (req, res) => {
  try {
    const block = await HostelBlock.findById(req.params.id);
    if (!block) {
      req.flash('error_msg', 'Hostel block not found.');
      return res.redirect('/admin/blocks');
    }

    res.render('admin/blocks/form', {
      pageTitle: `Edit Block: ${block.name}`,
      path: '/admin/blocks',
      block,
      isEditing: true,
    });
  } catch (error) {
    console.error('Get Block Edit Error:', error);
    req.flash('error_msg', 'Failed to retrieve block.');
    res.redirect('/admin/blocks');
  }
};

const putBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, numberOfFloors, genderRestriction, status } = req.body;

    const block = await HostelBlock.findById(id);
    if (!block) {
      req.flash('error_msg', 'Hostel block not found.');
      return res.redirect('/admin/blocks');
    }

    // Check duplicate code
    const duplicate = await HostelBlock.findOne({
      _id: { $ne: id },
      code: code.toUpperCase(),
    });
    if (duplicate) {
      req.flash('error_msg', 'Another block is already using this code.');
      return res.redirect(`/admin/blocks/${id}/edit`);
    }

    block.name = name;
    block.code = code.toUpperCase();
    block.description = description;
    block.numberOfFloors = Number(numberOfFloors);
    block.genderRestriction = genderRestriction;
    block.status = status;

    await block.save();

    req.flash('success_msg', 'Hostel block updated successfully.');
    res.redirect('/admin/blocks');
  } catch (error) {
    console.error('Update Block Error:', error);
    req.flash('error_msg', 'Failed to update block: ' + error.message);
    res.redirect(`/admin/blocks/${req.params.id}/edit`);
  }
};

const deleteBlock = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if rooms belong to this block
    const roomsCount = await Room.countDocuments({ block: id });
    if (roomsCount > 0) {
      req.flash('error_msg', `Cannot delete block. There are ${roomsCount} room(s) assigned to this block. Delete or reassign those rooms first.`);
      return res.redirect('/admin/blocks');
    }

    await HostelBlock.findByIdAndDelete(id);

    req.flash('success_msg', 'Hostel block deleted successfully.');
    res.redirect('/admin/blocks');
  } catch (error) {
    console.error('Delete Block Error:', error);
    req.flash('error_msg', 'Failed to delete block: ' + error.message);
    res.redirect('/admin/blocks');
  }
};

module.exports = {
  getBlocks,
  getBlockNew,
  postBlock,
  getBlockEdit,
  putBlock,
  deleteBlock,
};
