require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');
const RoomAllotment = require('../models/RoomAllotment');
const RoomRequest = require('../models/RoomRequest');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MessMenu = require('../models/MessMenu');
const MealFeedback = require('../models/MealFeedback');
const MessBill = require('../models/MessBill');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_db';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to database.');

    // Clear collections
    console.log('[Seed] Clearing existing records...');
    await Promise.all([
      User.deleteMany({}),
      HostelBlock.deleteMany({}),
      Room.deleteMany({}),
      RoomAllotment.deleteMany({}),
      RoomRequest.deleteMany({}),
      MaintenanceRequest.deleteMany({}),
      MessMenu.deleteMany({}),
      MealFeedback.deleteMany({}),
      MessBill.deleteMany({}),
    ]);

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const admin = new User({
      name: 'Chief Warden Sharma',
      email: 'admin@hostel.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 00001',
      department: 'Hostel Administration',
    });
    await admin.save();

    const student1 = new User({
      name: 'Aarav Patel',
      email: 'student1@example.com',
      password: 'Student@123',
      role: 'student',
      studentId: 'STU-2026-001',
      phone: '+91 98765 11111',
      gender: 'Male',
      department: 'Computer Science',
      year: '3rd Year',
    });
    await student1.save();

    const student2 = new User({
      name: 'Diya Sen',
      email: 'student2@example.com',
      password: 'Student@123',
      role: 'student',
      studentId: 'STU-2026-002',
      phone: '+91 98765 22222',
      gender: 'Female',
      department: 'Electronics & Comm.',
      year: '2nd Year',
    });
    await student2.save();

    const student3 = new User({
      name: 'Rohan Verma',
      email: 'student3@example.com',
      password: 'Student@123',
      role: 'student',
      studentId: 'STU-2026-003',
      phone: '+91 98765 33333',
      gender: 'Male',
      department: 'Information Technology',
      year: '1st Year',
    });
    await student3.save();

    const student4 = new User({
      name: 'Ananya Roy',
      email: 'student4@example.com',
      password: 'Student@123',
      role: 'student',
      studentId: 'STU-2026-004',
      phone: '+91 98765 44444',
      gender: 'Female',
      department: 'Mechanical Eng.',
      year: '1st Year',
    });
    await student4.save();

    // 2. Create Hostel Blocks
    console.log('[Seed] Creating hostel blocks...');
    const blockA = await HostelBlock.create({
      name: 'Block A - Aryabhatta Hall',
      code: 'BLK-A',
      description: 'Senior boys residence with quiet study lounges and high-speed campus LAN.',
      numberOfFloors: 3,
      genderRestriction: 'Male',
      status: 'Active',
    });

    const blockB = await HostelBlock.create({
      name: 'Block B - Gargi Bhavan',
      code: 'BLK-B',
      description: 'Women residence hall with 24/7 security, recreational lawn, and dining hall.',
      numberOfFloors: 4,
      genderRestriction: 'Female',
      status: 'Active',
    });

    const blockC = await HostelBlock.create({
      name: 'Block C - Ramanujan PG Wing',
      code: 'BLK-C',
      description: 'Postgraduate and international scholars residence complex.',
      numberOfFloors: 2,
      genderRestriction: 'Co-ed',
      status: 'Active',
    });

    // 3. Create Rooms
    console.log('[Seed] Creating rooms...');
    const roomA101 = await Room.create({
      block: blockA._id,
      roomNumber: 'A-101',
      floor: 1,
      roomType: 'Single',
      capacity: 1,
      currentOccupancy: 0,
      monthlyFee: 4500,
      facilities: ['Attached Bathroom', 'Wi-Fi', 'AC', 'Study Table', 'Cupboard', 'Fan'],
      status: 'Available',
    });

    const roomA102 = await Room.create({
      block: blockA._id,
      roomNumber: 'A-102',
      floor: 1,
      roomType: 'Double',
      capacity: 2,
      currentOccupancy: 1, // Student 1 will be allotted
      monthlyFee: 3200,
      facilities: ['Wi-Fi', 'Study Table', 'Cupboard', 'Fan', 'Balcony'],
      status: 'Available',
    });

    const roomA103 = await Room.create({
      block: blockA._id,
      roomNumber: 'A-103',
      floor: 1,
      roomType: 'Triple',
      capacity: 3,
      currentOccupancy: 0,
      monthlyFee: 2400,
      facilities: ['Wi-Fi', 'Fan', 'Cupboard', 'Study Table'],
      status: 'Available',
    });

    const roomB201 = await Room.create({
      block: blockB._id,
      roomNumber: 'B-201',
      floor: 2,
      roomType: 'Double',
      capacity: 2,
      currentOccupancy: 1, // Student 2 will be allotted
      monthlyFee: 3500,
      facilities: ['Attached Bathroom', 'Wi-Fi', 'Study Table', 'Cupboard', 'Fan'],
      status: 'Available',
    });

    const roomB202 = await Room.create({
      block: blockB._id,
      roomNumber: 'B-202',
      floor: 2,
      roomType: 'Single',
      capacity: 1,
      currentOccupancy: 1,
      monthlyFee: 4800,
      facilities: ['Attached Bathroom', 'AC', 'Wi-Fi', 'Balcony', 'Study Table', 'Cupboard', 'Fan'],
      status: 'Full',
    });

    const roomC301 = await Room.create({
      block: blockC._id,
      roomNumber: 'C-301',
      floor: 3,
      roomType: 'Dormitory',
      capacity: 4,
      currentOccupancy: 0,
      monthlyFee: 1800,
      facilities: ['Wi-Fi', 'Fan', 'Cupboard', 'Study Table'],
      status: 'Available',
    });

    // 4. Create Active Allotments
    console.log('[Seed] Creating active room allotments...');
    await RoomAllotment.create({
      student: student1._id,
      room: roomA102._id,
      block: blockA._id,
      startDate: new Date('2026-08-01'),
      status: 'Active',
    });

    await RoomAllotment.create({
      student: student2._id,
      room: roomB201._id,
      block: blockB._id,
      startDate: new Date('2026-08-10'),
      status: 'Active',
    });

    // 5. Create Pending Room Request
    console.log('[Seed] Creating sample room requests...');
    await RoomRequest.create({
      student: student3._id,
      preferredBlock: blockA._id,
      preferredRoom: roomA101._id,
      preferredRoomType: 'Single',
      remarks: 'Need quiet room for final year research project preparation.',
      status: 'Pending',
    });

    // 6. Create Maintenance Request
    console.log('[Seed] Creating sample maintenance tickets...');
    await MaintenanceRequest.create({
      student: student1._id,
      room: roomA102._id,
      block: blockA._id,
      category: 'Electrical',
      title: 'Study table light switch flickering',
      description: 'The wall switch socket for desk lamp sparks intermittently when toggled.',
      priority: 'Medium',
      status: 'In Progress',
      adminRemarks: 'Electrician assigned for afternoon inspection.',
    });

    // 7. Create Weekly Mess Menu
    console.log('[Seed] Creating weekly mess menu...');
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    await MessMenu.create({
      title: 'Standard Weekly Campus Menu',
      weekStartDate: monday,
      weekEndDate: sunday,
      status: 'Published',
      publishedBy: admin._id,
      publishedDate: new Date(),
      menu: {
        monday: {
          breakfast: 'Aloo Poha, Boiled Egg / Banana, Filter Coffee, Tea',
          lunch: 'Jeera Rice, Yellow Dal Tadka, Aloo Gobhi, Phulka Roti, Salad',
          snacks: 'Veg Samosa with Mint Chutney, Masala Chai',
          dinner: 'Steamed Basmati Rice, Paneer Butter Masala, Mixed Dal, Roti, Gulab Jamun',
        },
        tuesday: {
          breakfast: 'Idli & Medu Vada, Coconut Chutney, Sambar, Tea',
          lunch: 'Steamed Rice, Rajma Masala, Bhindi Fry, Tawa Roti, Papad',
          snacks: 'Bread Pakora, Tea, Green Chutney',
          dinner: 'Veg Pulao, Dal Fry, Kadai Paneer, Chapati, Kheer',
        },
        wednesday: {
          breakfast: 'Masala Upma, Coconut Chutney, Sprouts, Hot Milk / Tea',
          lunch: 'Rice, Chole Masala, Jeera Aloo, Bhatura / Roti, Boondi Raita',
          snacks: 'Onion Pakoda, Masala Chai',
          dinner: 'Egg Curry / Shahi Paneer, Dal Makhani, Steamed Rice, Butter Roti',
        },
        thursday: {
          breakfast: 'Stuffed Aloo Paratha, Butter, Pickle, Curd, Tea',
          lunch: 'Lemon Rice, Dal Palak, Baingan Bharta, Chapati, Curd',
          snacks: 'Biscuits, Rusks, Filter Coffee & Tea',
          dinner: 'Fried Rice, Veg Manchurian, Dal Tadka, Roti, Ice Cream',
        },
        friday: {
          breakfast: 'Uttapam with Tomato Chutney & Sambar, Fresh Fruit, Tea',
          lunch: 'Rice, Sambhar, Poriyal, Rasam, Papad, Curd',
          snacks: 'Pav Bhaji, Lemonade / Tea',
          dinner: 'Matar Paneer, Dal Fry, Jeera Rice, Tandoori Roti, Rasgulla',
        },
        saturday: {
          breakfast: 'Puri Sabji, Halwa, Pickle, Masala Chai',
          lunch: 'Kadhi Pakoda, Steamed Rice, Aloo Capsicum, Phulka Roti',
          snacks: 'Corn Chaat, Tea & Coffee',
          dinner: 'Veg Biryani, Mirchi Ka Salan, Raita, Mixed Dal, Sweet Sewai',
        },
        sunday: {
          breakfast: 'Masala Dosa, Sambar, Two Chutneys, Filter Coffee',
          lunch: 'Special Sunday Feast: Paneer Tikka Masala / Chicken Curry, Pulao, Naan, Gulab Jamun',
          snacks: 'Maggi Noodles, Hot Tea',
          dinner: 'Light Khichdi, Kadhi, Papad, Achar, Fresh Cut Fruits',
        },
      },
    });

    // 8. Create Meal Feedback
    console.log('[Seed] Creating sample meal feedback...');
    await MealFeedback.create({
      student: student1._id,
      date: new Date(),
      mealType: 'Lunch',
      rating: 4,
      comments: 'Rajma was delicious and freshly cooked. Rice was hot.',
    });

    await MealFeedback.create({
      student: student2._id,
      date: new Date(),
      mealType: 'Breakfast',
      rating: 5,
      comments: 'Crispy dosas and very tasty sambar. Great quality!',
    });

    // 9. Create Sample Mess Bills (Stretch feature)
    console.log('[Seed] Creating sample monthly mess bills...');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    await MessBill.create({
      student: student1._id,
      month: currentMonth,
      year: currentYear,
      presentDays: 26,
      ratePerDay: 120,
      totalAmount: 26 * 120, // 3120
      status: 'Paid',
      paidAt: new Date(),
      notes: 'Paid via UPI at warden counter',
    });

    await MessBill.create({
      student: student2._id,
      month: currentMonth,
      year: currentYear,
      presentDays: 24,
      ratePerDay: 120,
      totalAmount: 24 * 120, // 2880
      status: 'Unpaid',
      notes: 'Due by month end',
    });

    console.log('======================================================');
    console.log(' Database Seeded Successfully!');
    console.log(' Demo Accounts Created:');
    console.log(' 1. Admin / Warden: admin@hostel.com  / Admin@123');
    console.log(' 2. Student 1:      student1@example.com / Student@123 (Allotted)');
    console.log(' 3. Student 2:      student2@example.com / Student@123 (Allotted)');
    console.log(' 4. Student 3:      student3@example.com / Student@123 (Request Pending)');
    console.log(' 5. Student 4:      student4@example.com / Student@123 (Ready to apply)');
    console.log('======================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
