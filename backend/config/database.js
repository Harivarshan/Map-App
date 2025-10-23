const mongoose = require('mongoose');

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required to connect to MongoDB.');
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Unable to connect to MongoDB', error);
    throw error;
  }
};

module.exports = connectDatabase;
