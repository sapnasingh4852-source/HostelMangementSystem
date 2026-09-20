const mongoose = require('mongoose');

const hostelBlockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Block name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Block code is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    numberOfFloors: {
      type: Number,
      required: [true, 'Number of floors is required'],
      min: [1, 'Number of floors must be at least 1'],
      default: 3,
    },
    genderRestriction: {
      type: String,
      enum: ['Male', 'Female', 'Co-ed'],
      default: 'Co-ed',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Under Maintenance'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HostelBlock', hostelBlockSchema);
