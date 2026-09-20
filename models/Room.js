const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelBlock',
      required: [true, 'Hostel block is required'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: [0, 'Floor cannot be negative'],
      default: 1,
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Dormitory'],
      required: [true, 'Room type is required'],
      default: 'Double',
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Capacity must be at least 1 bed'],
      default: 2,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: [0, 'Current occupancy cannot be negative'],
    },
    monthlyFee: {
      type: Number,
      default: 0,
      min: [0, 'Monthly fee cannot be negative'],
    },
    facilities: {
      type: [String],
      default: ['Wi-Fi', 'Study Table', 'Cupboard', 'Fan'],
    },
    status: {
      type: String,
      enum: ['Available', 'Full', 'Maintenance', 'Inactive'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure uniqueness of room number within a block
roomSchema.index({ block: 1, roomNumber: 1 }, { unique: true });

// Virtual to calculate available beds
roomSchema.virtual('availableBeds').get(function () {
  return Math.max(0, this.capacity - this.currentOccupancy);
});

// Middleware to sync status with occupancy
roomSchema.pre('save', function (next) {
  if (this.status !== 'Maintenance' && this.status !== 'Inactive') {
    if (this.currentOccupancy >= this.capacity) {
      this.status = 'Full';
    } else {
      this.status = 'Available';
    }
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
