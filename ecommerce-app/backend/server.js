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
function startServer(app, requestedPort = env.PORT) {
  return new Promise((resolve, reject) => {
    const basePort = Number.parseInt(requestedPort, 10);

    if (!Number.isInteger(basePort) || basePort < 0 || basePort > 65535) {
      reject(new Error(`Invalid port value: ${requestedPort}`));
      return;
    }

    let currentPort = basePort;
    let attempts = 0;

    const attemptListen = () => {
      const server = app.listen(currentPort, () => {
        console.log(`Server listening on port ${currentPort} [${env.NODE_ENV}]`);
        resolve(server);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          attempts += 1;

          if (attempts > 20) {
            reject(new Error(`Unable to find an open port after ${attempts} attempts.`));
            return;
          }

          currentPort += 1;
          console.warn(`Port ${currentPort - 1} is busy; retrying on ${currentPort}.`);
          server.close(() => attemptListen());
          return;
        }

        reject(err);
      });
    };

    attemptListen();
  });
}

async function start() {
  await connectDB();

  const securityMiddleware = SecurityEngine.init({
    storageAdapter: securityAdapter,
    // Detector threshold overrides can be added here later, e.g.:
    // detectors: { bruteForce: { maxAttemptsPerAccount: 5 } }
    // Persist full raw payloads for contact endpoint attacks (opt-in).
    storeRawPayloadFor: ['/api/contact']
  });

  const app = createApp(securityMiddleware);
  return startServer(app, env.PORT);
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { start, startServer };