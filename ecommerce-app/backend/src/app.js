const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const env = require('./config/env');

/**
 * createApp
 *
 * Builds the Express app as a factory rather than a top-level script. The
 * securityMiddleware is injected as a parameter rather than hardcoded here,
 * which is what lets Phase 4's tests push real HTTP requests through the
 * real Express + Security Engine pipeline using a fake in-memory
 * storageAdapter, with zero dependency on a live MongoDB connection.
 * server.js (the real entry point) supplies the real, Mongo-backed
 * middleware built from SecurityEngine.init().
 *
 * Middleware order matters and mirrors the architecture doc's request
 * lifecycle (§10): helmet/cors/parsers -> Security Engine -> routes -> error handler.
 *
 * @param {import('express').RequestHandler} securityMiddleware
 * @returns {import('express').Express}
 */
function createApp(securityMiddleware) {
  const app = express();

  app.use(helmet());

  // credentials: true is required for the httpOnly JWT cookie to be sent
  // cross-origin between Vercel (frontend) and Render (backend) — see
  // docs/architecture §11 and §9.
  const allowedOrigins = new Set([
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ]);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin not allowed: ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  // Security Engine — runs on every request except configured ignorePaths,
  // before any route/controller executes.
  app.use(securityMiddleware);

  app.use('/api', routes);

  // Must be registered last.
  app.use(errorHandler);

  return app;
}

module.exports = createApp;