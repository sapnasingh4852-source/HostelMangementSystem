const mongoose = require('mongoose');

const mealDaySchema = new mongoose.Schema(
  {
    breakfast: { type: String, default: '', trim: true },
    lunch: { type: String, default: '', trim: true },
    snacks: { type: String, default: '', trim: true },
    dinner: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const messMenuSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: 'Weekly Mess Menu',
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
    },
    weekEndDate: {
      type: Date,
      required: [true, 'Week end date is required'],
    },
    menu: {
      monday: { type: mealDaySchema, default: () => ({}) },
      tuesday: { type: mealDaySchema, default: () => ({}) },
      wednesday: { type: mealDaySchema, default: () => ({}) },
      thursday: { type: mealDaySchema, default: () => ({}) },
      friday: { type: mealDaySchema, default: () => ({}) },
      saturday: { type: mealDaySchema, default: () => ({}) },
      sunday: { type: mealDaySchema, default: () => ({}) },
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MessMenu', messMenuSchema);
