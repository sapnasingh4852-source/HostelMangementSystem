const mongoose = require('mongoose');

const messBillSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    presentDays: {
      type: Number,
      required: [true, 'Present days count is required'],
      min: 0,
      max: 31,
    },
    ratePerDay: {
      type: Number,
      required: [true, 'Per-day mess rate is required'],
      default: 120,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total bill amount is required'],
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Paid', 'Waived'],
      default: 'Unpaid',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

messBillSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MessBill', messBillSchema);
