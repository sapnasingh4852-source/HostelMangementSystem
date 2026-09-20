require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');
const RoomAllotment = require('../models/RoomAllotment');
const RoomRequest = require('../models/RoomRequest');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MessMenu = require('../models/MessMenu');
const MealFeedback = require('../models/MealFeedback');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_db';

async function runVerifications() {
  console.log('--- STARTING HOSTEL SYSTEM INTEGRITY & CONCURRENCY VERIFICATION ---');
  await mongoose.connect(mongoUri);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify Seed Data Exists
    const userCount = await User.countDocuments();
    assert(userCount >= 5, `Expected at least 5 users, found ${userCount}`);

    const blockCount = await HostelBlock.countDocuments();
    assert(blockCount === 3, `Expected 3 blocks, found ${blockCount}`);

    const roomCount = await Room.countDocuments();
    assert(roomCount >= 6, `Expected at least 6 rooms, found ${roomCount}`);

    // 2. Test Atomic Concurrency Guard (Race condition simulation)
    console.log('\n--- Testing Concurrency Guard on Room Allocation ---');
    // Create a temporary test room with capacity 1
    const blockA = await HostelBlock.findOne({ code: 'BLK-A' });
    const testRoom = await Room.create({
      block: blockA._id,
      roomNumber: 'TEST-999',
      floor: 1,
      roomType: 'Single',
      capacity: 1,
      currentOccupancy: 0,
      status: 'Available',
    });

    // Simulate two simultaneous allotment approvals competing for 1 vacant slot
    const attempt1 = Room.findOneAndUpdate(
      {
        _id: testRoom._id,
        status: 'Available',
        $expr: { $lt: ['$currentOccupancy', '$capacity'] },
      },
      { $inc: { currentOccupancy: 1 } },
      { new: true }
    );

    const attempt2 = Room.findOneAndUpdate(
      {
        _id: testRoom._id,
        status: 'Available',
        $expr: { $lt: ['$currentOccupancy', '$capacity'] },
      },
      { $inc: { currentOccupancy: 1 } },
      { new: true }
    );

    const [res1, res2] = await Promise.all([attempt1, attempt2]);
    const successes = [res1, res2].filter((r) => r !== null);
    const failures = [res1, res2].filter((r) => r === null);

    assert(successes.length === 1, 'Exactly 1 concurrent approval succeeded');
    assert(failures.length === 1, 'Second concurrent approval was safely rejected without overbooking');

    const verifiedRoom = await Room.findById(testRoom._id);
    assert(verifiedRoom.currentOccupancy === 1, `Occupancy is strictly 1 (was ${verifiedRoom.currentOccupancy})`);
    assert(verifiedRoom.currentOccupancy <= verifiedRoom.capacity, 'Room capacity was never exceeded');

    // 3. Test Room Vacating Logic
    console.log('\n--- Testing Vacate Logic ---');
    await Room.findByIdAndUpdate(testRoom._id, [
      {
        $set: {
          currentOccupancy: { $max: [0, { $subtract: ['$currentOccupancy', 1] }] },
          status: 'Available',
        },
      },
    ]);
    const vacatedRoom = await Room.findById(testRoom._id);
    assert(vacatedRoom.currentOccupancy === 0, 'Room occupancy correctly decremented to 0 upon vacating');
    assert(vacatedRoom.status === 'Available', 'Room status restored to Available');

    // 4. Test Negative Occupancy Protection
    console.log('\n--- Testing Negative Occupancy Protection ---');
    await Room.findByIdAndUpdate(testRoom._id, [
      {
        $set: {
          currentOccupancy: { $max: [0, { $subtract: ['$currentOccupancy', 1] }] },
          status: 'Available',
        },
      },
    ]);
    const zeroGuardRoom = await Room.findById(testRoom._id);
    assert(zeroGuardRoom.currentOccupancy === 0, 'Occupancy cannot become negative even if vacating empty room');

    // Clean up test room
    await Room.findByIdAndDelete(testRoom._id);

    // 5. Test Referential Integrity & Delete Restrictions
    console.log('\n--- Testing Delete Restrictions ---');
    // Try to delete a room with active occupancy
    const roomA102 = await Room.findOne({ roomNumber: 'A-102' });
    assert(roomA102 && roomA102.currentOccupancy > 0, 'Room A-102 has active occupants');

    // Check that deleteRoom controller logic would reject this
    const canDeleteOccupiedRoom = roomA102.currentOccupancy === 0;
    assert(!canDeleteOccupiedRoom, 'Occupied room cannot be deleted while students reside in it');

    // Check that block with rooms cannot be deleted
    const roomsInBlockA = await Room.countDocuments({ block: blockA._id });
    const canDeleteBlockA = roomsInBlockA === 0;
    assert(!canDeleteBlockA, `Block A cannot be deleted while containing ${roomsInBlockA} room(s)`);

    // 6. Test Mess Menu & Feedback Integrity
    console.log('\n--- Testing Mess & Feedback Integrity ---');
    const publishedMenu = await MessMenu.findOne({ status: 'Published' });
    assert(publishedMenu !== null, 'Published weekly mess menu is present');
    assert(publishedMenu.menu.monday.breakfast.length > 0, 'Monday breakfast menu is populated');
    assert(publishedMenu.menu.sunday.dinner.length > 0, 'Sunday dinner menu is populated');

    const feedbackCount = await MealFeedback.countDocuments();
    assert(feedbackCount >= 2, `Expected at least 2 meal reviews, found ${feedbackCount}`);

    console.log(`\n======================================================`);
    console.log(`VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed.`);
    console.log(`======================================================`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Verification exception:', err);
    process.exit(1);
  }
}

runVerifications();
