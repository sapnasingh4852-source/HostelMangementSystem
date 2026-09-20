const MessMenu = require('../models/MessMenu');

// --- STUDENT ACTIONS ---

const getStudentMessMenu = async (req, res) => {
  try {
    const now = new Date();

    // Find current published menu or latest published menu
    const menu =
      (await MessMenu.findOne({
        status: 'Published',
        weekStartDate: { $lte: now },
        weekEndDate: { $gte: now },
      })) ||
      (await MessMenu.findOne({ status: 'Published' }).sort({ weekStartDate: -1 }));

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];

    res.render('student/mess-menu', {
      pageTitle: 'Weekly Mess Menu',
      path: '/student/mess-menu',
      menu,
      currentDay,
    });
  } catch (error) {
    console.error('Get Student Mess Menu Error:', error);
    req.flash('error_msg', 'Failed to load mess menu.');
    res.redirect('/student/dashboard');
  }
};

// --- ADMIN ACTIONS ---

const getAdminMess = async (req, res) => {
  try {
    const menus = await MessMenu.find()
      .populate('publishedBy', 'name')
      .sort({ weekStartDate: -1 });

    res.render('admin/mess/index', {
      pageTitle: 'Mess Menu Management',
      path: '/admin/mess',
      menus,
    });
  } catch (error) {
    console.error('Get Admin Mess Error:', error);
    req.flash('error_msg', 'Failed to load mess menus.');
    res.redirect('/admin/dashboard');
  }
};

const getAdminMessNew = (req, res) => {
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextSunday.getDate() + 6);

  res.render('admin/mess/form', {
    pageTitle: 'Create Weekly Mess Menu',
    path: '/admin/mess',
    menu: {
      title: 'Weekly Mess Menu',
      weekStartDate: nextMonday,
      weekEndDate: nextSunday,
      menu: {},
    },
    isEditing: false,
  });
};

const postAdminMess = async (req, res) => {
  try {
    const { title, weekStartDate, weekEndDate, status, days } = req.body;

    const newMenu = new MessMenu({
      title: title || 'Weekly Mess Menu',
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate),
      status: status || 'Draft',
      publishedBy: req.session.userId,
      publishedDate: status === 'Published' ? new Date() : undefined,
      menu: days || {},
    });

    await newMenu.save();

    req.flash('success_msg', 'Weekly mess menu saved successfully.');
    res.redirect('/admin/mess');
  } catch (error) {
    console.error('Post Admin Mess Error:', error);
    req.flash('error_msg', 'Failed to create mess menu: ' + error.message);
    res.redirect('/admin/mess/new');
  }
};

const getAdminMessEdit = async (req, res) => {
  try {
    const menu = await MessMenu.findById(req.params.id);
    if (!menu) {
      req.flash('error_msg', 'Mess menu not found.');
      return res.redirect('/admin/mess');
    }

    res.render('admin/mess/form', {
      pageTitle: 'Edit Mess Menu',
      path: '/admin/mess',
      menu,
      isEditing: true,
    });
  } catch (error) {
    console.error('Get Admin Mess Edit Error:', error);
    req.flash('error_msg', 'Failed to load mess menu.');
    res.redirect('/admin/mess');
  }
};

const putAdminMess = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, weekStartDate, weekEndDate, status, days } = req.body;

    const menu = await MessMenu.findById(id);
    if (!menu) {
      req.flash('error_msg', 'Mess menu not found.');
      return res.redirect('/admin/mess');
    }

    menu.title = title;
    menu.weekStartDate = new Date(weekStartDate);
    menu.weekEndDate = new Date(weekEndDate);
    menu.status = status;
    menu.menu = days;

    if (status === 'Published' && !menu.publishedDate) {
      menu.publishedDate = new Date();
      menu.publishedBy = req.session.userId;
    }

    await menu.save();

    req.flash('success_msg', 'Weekly mess menu updated successfully.');
    res.redirect('/admin/mess');
  } catch (error) {
    console.error('Update Mess Menu Error:', error);
    req.flash('error_msg', 'Failed to update mess menu: ' + error.message);
    res.redirect(`/admin/mess/${req.params.id}/edit`);
  }
};

const deleteAdminMess = async (req, res) => {
  try {
    const { id } = req.params;
    await MessMenu.findByIdAndDelete(id);

    req.flash('success_msg', 'Mess menu deleted successfully.');
    res.redirect('/admin/mess');
  } catch (error) {
    console.error('Delete Mess Menu Error:', error);
    req.flash('error_msg', 'Failed to delete mess menu: ' + error.message);
    res.redirect('/admin/mess');
  }
};

module.exports = {
  getStudentMessMenu,
  getAdminMess,
  getAdminMessNew,
  postAdminMess,
  getAdminMessEdit,
  putAdminMess,
  deleteAdminMess,
};
