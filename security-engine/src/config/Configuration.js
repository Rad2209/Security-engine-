const defaultConfig = require('./defaultConfig');

/**
 * Configuration
 *
 * Merges the host app's config with defaultConfig, and validates that a
 * usable storageAdapter was provided. Fails fast and loudly at startup
 * rather than failing silently on the first request, since a missing
 * adapter method would otherwise only surface as a runtime crash deep
 * inside a detector.
 */

// Methods every storageAdapter must implement. Kept as a flat list here
// (rather than instanceof checks against StorageAdapter) so a plain object
// satisfies the contract too — duck typing, not forced inheritance.
const REQUIRED_ADAPTER_METHODS = [
  'isIpBlocked',
  'isAccountBlocked',
  'recordFailedAttempt',
  'countRecentAttempts',
  'resetAttempts',
  'createBlock',
  'unblockIp',
  'saveAttackLog',
  'getLogs',
];

/**
 * Deep-merges two plain objects, with values in `overrides` taking
 * precedence over `base`. Only merges plain objects; arrays and primitives
 * in `overrides` fully replace the corresponding value in `base`.
 */
function deepMerge(base, overrides) {
  const result = { ...base };

  for (const key of Object.keys(overrides || {})) {
    const baseVal = base[key];
    const overrideVal = overrides[key];

    const bothPlainObjects =
      baseVal &&
      overrideVal &&
      typeof baseVal === 'object' &&
      typeof overrideVal === 'object' &&
      !Array.isArray(baseVal) &&
      !Array.isArray(overrideVal);

    result[key] = bothPlainObjects ? deepMerge(baseVal, overrideVal) : overrideVal;
  }

  return result;
}

function validateAdapter(adapter) {
  if (!adapter || typeof adapter !== 'object') {
    throw new Error(
      '[SecurityEngine] A storageAdapter is required. Pass an object implementing ' +
        'the StorageAdapter interface into SecurityEngine.init({ storageAdapter }).'
    );
  }

  const missing = REQUIRED_ADAPTER_METHODS.filter(
    (method) => typeof adapter[method] !== 'function'
  );

  if (missing.length > 0) {
    throw new Error(
      `[SecurityEngine] storageAdapter is missing required method(s): ${missing.join(', ')}`
    );
  }
}

/**
 * @param {object} userConfig - config passed by the host app to SecurityEngine.init()
 * @returns {object} fully-merged, validated configuration
 */
// function buildConfig(userConfig = {}) {
//   validateAdapter(userConfig.storageAdapter);

//   const merged = deepMerge(defaultConfig, userConfig);

//   // storageAdapter isn't part of defaultConfig (it has no sensible default),
//   // so make sure it survives the merge explicitly.
//   merged.storageAdapter = userConfig.storageAdapter;

//   return merged;
// }

function buildConfig(userConfig = {}) {
  validateAdapter(userConfig.storageAdapter);

  const merged = deepMerge(defaultConfig, userConfig);
  merged.storageAdapter = userConfig.storageAdapter;

  // Convert path-list arrays to Sets ONCE here, at config-build time (which
  // runs once per SecurityEngine.init() call), rather than checking
  // membership with Array.includes() on every single incoming request.
  merged.ignorePaths = new Set(merged.ignorePaths);
  merged.detectors.bruteForce.protectedRoutes = new Set(merged.detectors.bruteForce.protectedRoutes);

  return merged;
}

module.exports = { buildConfig, deepMerge, REQUIRED_ADAPTER_METHODS };