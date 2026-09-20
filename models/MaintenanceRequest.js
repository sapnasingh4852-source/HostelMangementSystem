const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: [
        'Electrical',
        'Plumbing',
        'Fan',
        'Light',
        'Furniture',
        'Wi-Fi',
        'Door/Window',
        'Cleaning',
        'Other',
      ],
      required: [true, 'Category is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    adminRemarks: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
