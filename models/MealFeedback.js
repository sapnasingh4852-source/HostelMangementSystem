const mongoose = require('mongoose');

const mealFeedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
      required: [true, 'Meal type is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comments: {
      type: String,
      trim: true,
    },
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessMenu',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MealFeedback', mealFeedbackSchema);
