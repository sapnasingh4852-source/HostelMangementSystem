const mongoose = require('mongoose');

const roomAllotmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelBlock',
      required: [true, 'Hostel block is required'],
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Vacated', 'Cancelled'],
      default: 'Active',
    },
    vacatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index to help quickly find active allotment of a student
roomAllotmentSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('RoomAllotment', roomAllotmentSchema);
