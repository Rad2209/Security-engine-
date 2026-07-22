/**
 * securityAdapter.js
 *
 * This is the seam described in the architecture doc (§1, §2): the
 * security-engine never imports this app's models, and this app never
 * imports the engine's internal collections directly. This file is the only
 * place the two sides touch, and it does so through the StorageAdapter
 * contract, not through shared schemas.
 *
 * Deliberately importing MongoStorageAdapter via its direct file path
 * (rather than from the package's main index.js) so that requiring
 * security-engine's core middleware never forces a `mongoose` dependency on
 * an app that doesn't want the Mongo adapter. Only this file, which
 * explicitly opts into Mongo, pulls it in.
 *
 * IMPORTANT: the security-engine package has its own nested mongoose
 * dependency copy. The host app already owns the one shared MongoDB
 * connection, so we inject that shared instance into the adapter before
 * constructing it. Without this, the engine's internal BlockedIp model can
 * end up querying a different Mongoose connection object that never
 * reaches the ready state, causing the buffer timeouts you see here.
 */
const mongoose = require('mongoose');
globalThis.__securityEngineMongoose = mongoose;

const MongoStorageAdapter = require('security-engine/src/storage/MongoStorageAdapter');

module.exports = new MongoStorageAdapter();