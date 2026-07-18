const mongoose = require('mongoose');
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

  await mongoose.connect(env.MONGO_URI);
  console.log(`MongoDB connected (${env.NODE_ENV})`);
}

module.exports = connectDB;