/**
 * security-engine — public API
 *
 * Usage in a host app:
 *
 *   const SecurityEngine = require('security-engine');
 *   const myAdapter = require('./middleware/securityAdapter'); // implements StorageAdapter
 *
 *   app.use(SecurityEngine.init({
 *     storageAdapter: myAdapter,
 *     detectors: { bruteForce: { maxAttemptsPerAccount: 5 } } // optional overrides
 *   }));
 */
const SecurityEngine = require('./core/SecurityEngine');
const StorageAdapter = require('./storage/StorageAdapter');

module.exports = SecurityEngine;
module.exports.StorageAdapter = StorageAdapter;