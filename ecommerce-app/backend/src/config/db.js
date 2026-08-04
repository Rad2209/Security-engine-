const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const env = require('./env');

/**
 * db.js
 *
 * Establishes the single Mongoose connection used by both the app's own
 * models (User, Product, etc.) and the security-engine's MongoStorageAdapter
 * — they share one physical connection/database, but never share
 * collections or schemas (see docs/architecture §6 for the full data
 * ownership breakdown).
 */
async function connectDB() {
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB connected (${env.NODE_ENV})`);
  } catch (err) {
    console.warn('Primary MongoDB connection failed, starting an in-memory fallback instance.');

    const memoryServer = await MongoMemoryServer.create();
    const mongoUri = await memoryServer.getUri();

    env.MONGO_URI = mongoUri;
    process.env.MONGO_URI = mongoUri;

    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected via in-memory fallback (${env.NODE_ENV})`);
  }
}

module.exports = connectDB;