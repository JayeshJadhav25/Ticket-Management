const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/myDatabase';

const connectDB = async () => {
  try {
    console.log('connecting mongodb....')
    const conn = await mongoose.connect(uri);
    console.log('**********************************************')
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // process.exit(1);
  }
};

module.exports = connectDB;
