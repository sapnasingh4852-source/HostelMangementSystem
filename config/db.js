const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_db';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.error('Make sure MongoDB is running locally or specify a valid MONGODB_URI in your .env file.');
    // Do not crash the entire process immediately so developer can see clear diagnostic
    return null;
  }
};

module.exports = connectDB;
