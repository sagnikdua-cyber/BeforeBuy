import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Database not connected.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Graceful failure - do not exit process so live search remains functional
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
