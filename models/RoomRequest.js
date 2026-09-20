const mongoose = require('mongoose');

const roomRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
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
    remarks: {
      type: String,
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

module.exports = mongoose.model('RoomRequest', roomRequestSchema);
