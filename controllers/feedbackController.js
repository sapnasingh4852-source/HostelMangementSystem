const MealFeedback = require('../models/MealFeedback');

// --- STUDENT ACTIONS ---

const getStudentFeedback = async (req, res) => {
  try {
    const studentId = req.session.userId;
    const pastFeedback = await MealFeedback.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.render('student/feedback', {
      pageTitle: 'Meal Feedback',
      path: '/student/feedback',
      pastFeedback,
    });
  } catch (error) {
    console.error('Get Student Feedback Error:', error);
    req.flash('error_msg', 'Failed to load feedback page.');
    res.redirect('/student/dashboard');
  }
};

const postStudentFeedback = async (req, res) => {
  try {
    const studentId = req.session.userId;
    const { mealType, rating, comments } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      req.flash('error_msg', 'Please provide a valid rating between 1 and 5 stars.');
      return res.redirect('/student/feedback');
    }

    // Check if student already gave feedback today for this meal
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await MealFeedback.findOne({
      student: studentId,
      mealType,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    if (existing) {
      existing.rating = numRating;
      existing.comments = comments;
      await existing.save();
      req.flash('success_msg', `Your feedback for today's ${mealType} was updated!`);
    } else {
      const feedback = new MealFeedback({
        student: studentId,
        date: new Date(),
        mealType,
        rating: numRating,
        comments,
      });
      await feedback.save();
      req.flash('success_msg', `Thank you! Your feedback for ${mealType} has been recorded.`);
    }

    res.redirect('/student/feedback');
  } catch (error) {
    console.error('Post Feedback Error:', error);
    req.flash('error_msg', 'Failed to submit feedback: ' + error.message);
    res.redirect('/student/feedback');
  }
};

// --- ADMIN ACTIONS ---

const getAdminFeedbackDashboard = async (req, res) => {
  try {
    const allFeedback = await MealFeedback.find()
      .populate('student', 'name studentId department')
      .sort({ createdAt: -1 });

    const totalCount = allFeedback.length;
    const overallAvg =
      totalCount > 0
        ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalCount).toFixed(1)
        : 'N/A';

    // Today's feedback stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayFeedback = allFeedback.filter((f) => new Date(f.createdAt) >= todayStart);
    const todayAvg =
      todayFeedback.length > 0
        ? (todayFeedback.reduce((sum, f) => sum + f.rating, 0) / todayFeedback.length).toFixed(1)
        : 'N/A';

    // Meal type breakdown
    const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
    const mealStats = mealTypes.map((type) => {
      const items = allFeedback.filter((f) => f.mealType === type);
      const count = items.length;
      const avg = count > 0 ? (items.reduce((sum, f) => sum + f.rating, 0) / count).toFixed(1) : 'N/A';
      return { mealType: type, count, avg };
    });

    res.render('admin/mess/feedback', {
      pageTitle: 'Mess Meal Feedback Analytics',
      path: '/admin/mess-feedback',
      allFeedback,
      totalCount,
      overallAvg,
      todayAvg,
      mealStats,
    });
  } catch (error) {
    console.error('Admin Feedback Error:', error);
    req.flash('error_msg', 'Failed to load feedback analytics.');
    res.redirect('/admin/dashboard');
  }
};

module.exports = {
  getStudentFeedback,
  postStudentFeedback,
  getAdminFeedbackDashboard,
};
