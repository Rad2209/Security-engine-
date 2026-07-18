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
 */
const MongoStorageAdapter = require('security-engine/src/storage/MongoStorageAdapter');

module.exports = new MongoStorageAdapter();