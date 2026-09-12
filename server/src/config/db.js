import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[DB] Attempting connection to configured MONGODB_URI...`);
      await mongoose.connect(uri);
      console.log(`[DB] Successfully connected to MongoDB: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[DB] Connection to MONGODB_URI failed: ${err.message}. Falling back to in-memory instance.`);
    }
  }

  // Fallback to MongoMemoryServer
  try {
    console.log(`[DB] Initializing embedded in-memory MongoDB server...`);
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to embedded MongoDB at: ${memoryUri}`);
  } catch (err) {
    console.error(`[DB] Fatal error initializing MongoDB:`, err.message);
    throw err;
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

