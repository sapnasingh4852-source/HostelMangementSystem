const mongoose = require('mongoose');

const roomChangeRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    currentRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Current room is required'],
    },
    currentBlock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelBlock',
      required: [true, 'Current block is required'],
    },
    preferredBlock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelBlock',
      required: [true, 'Preferred block is required'],
    },
    preferredRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Preferred room is required'],
    },
    preferredRoomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Dormitory'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for room change is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    adminRemarks: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RoomChangeRequest', roomChangeRequestSchema);
