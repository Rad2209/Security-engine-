const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const createApp = require('./src/app');
const SecurityEngine = require('security-engine');
const securityAdapter = require('./src/middleware/securityAdapter');

/**
 * server.js
 *
 * Real entry point (`npm start`). Connects to MongoDB, builds the real
 * Security Engine middleware (backed by MongoStorageAdapter via
 * securityAdapter.js), assembles the Express app via createApp(), and
 * starts listening.
 *
 * Kept deliberately thin — all the actual wiring logic lives in app.js and
 * config/*, so this file is easy to read top-to-bottom as "what happens on
 * boot".
 */
async function start() {
  await connectDB();

  const securityMiddleware = SecurityEngine.init({
    storageAdapter: securityAdapter,
    // Detector threshold overrides can be added here later, e.g.:
    // detectors: { bruteForce: { maxAttemptsPerAccount: 5 } }
  });

  const app = createApp(securityMiddleware);

  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});