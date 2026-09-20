const MessBill = require('../models/MessBill');
const RoomAllotment = require('../models/RoomAllotment');
const User = require('../models/User');

// --- STUDENT ACTIONS ---

const getStudentBills = async (req, res) => {
  try {
    const studentId = req.session.userId;
    const bills = await MessBill.find({ student: studentId }).sort({ year: -1, month: -1 });

    res.render('student/bills', {
      pageTitle: 'My Mess Bills',
      path: '/student/bills',
      bills,
    });
  } catch (error) {
    console.error('Get Student Bills Error:', error);
    req.flash('error_msg', 'Failed to load mess bills.');
    res.redirect('/student/dashboard');
  }
};

// --- ADMIN ACTIONS ---

const getAdminBills = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const filter = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    if (status) filter.status = status;

    const bills = await MessBill.find(filter)
      .populate('student', 'name studentId email department')
      .sort({ year: -1, month: -1 });

    res.render('admin/bills/index', {
      pageTitle: 'Mess Billing Management',
      path: '/admin/bills',
      bills,
      query: req.query,
    });
  } catch (error) {
    console.error('Get Admin Bills Error:', error);
    req.flash('error_msg', 'Failed to load mess bills.');
    res.redirect('/admin/dashboard');
  }
};

const getAdminGenerateBill = async (req, res) => {
  try {
    const activeAllotments = await RoomAllotment.find({ status: 'Active' })
      .populate('student', 'name studentId department')
      .populate('room block');

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    res.render('admin/bills/generate', {
      pageTitle: 'Generate Monthly Mess Bills',
      path: '/admin/bills',
      activeAllotments,
      currentMonth,
      currentYear,
    });
  } catch (error) {
    console.error('Get Generate Bill Error:', error);
    req.flash('error_msg', 'Failed to load bill generation form.');
    res.redirect('/admin/bills');
  }
};

const postAdminGenerateBill = async (req, res) => {
  try {
    const { month, year, ratePerDay, defaultPresentDays } = req.body;
    const m = Number(month);
    const y = Number(year);
    const rate = Number(ratePerDay) || 120;
    const days = Number(defaultPresentDays) || 26;

    // Find all students with active room allotments
    const activeAllotments = await RoomAllotment.find({ status: 'Active' });

    let createdCount = 0;
    let skippedCount = 0;

    for (const allotment of activeAllotments) {
      const existing = await MessBill.findOne({
        student: allotment.student,
        month: m,
        year: y,
      });

      if (existing) {
        skippedCount++;
      } else {
        const totalAmount = days * rate;
        const bill = new MessBill({
          student: allotment.student,
          month: m,
          year: y,
          presentDays: days,
          ratePerDay: rate,
          totalAmount,
          status: 'Unpaid',
        });
        await bill.save();
        createdCount++;
      }
    }

    req.flash('success_msg', `Generated ${createdCount} mess bill(s) for Month ${m}/${y}. (${skippedCount} already existed).`);
    res.redirect('/admin/bills');
  } catch (error) {
    console.error('Generate Bills Error:', error);
    req.flash('error_msg', 'Failed to generate bills: ' + error.message);
    res.redirect('/admin/bills/generate');
  }
};

const postUpdateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const bill = await MessBill.findById(id);
    if (!bill) {
      req.flash('error_msg', 'Bill not found.');
      return res.redirect('/admin/bills');
    }

    bill.status = status;
    if (notes) bill.notes = notes;
    if (status === 'Paid') bill.paidAt = new Date();

    await bill.save();

    req.flash('success_msg', `Bill marked as ${status}.`);
    res.redirect('/admin/bills');
  } catch (error) {
    console.error('Update Bill Status Error:', error);
    req.flash('error_msg', 'Failed to update bill status: ' + error.message);
    res.redirect('/admin/bills');
  }
};

module.exports = {
  getStudentBills,
  getAdminBills,
  getAdminGenerateBill,
  postAdminGenerateBill,
  postUpdateBillStatus,
};
