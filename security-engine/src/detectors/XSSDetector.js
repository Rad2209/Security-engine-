const { xssPatterns } = require('../utils/patterns');

/**
 * XSSDetector
 *
 * Scans normalized request data for signatures commonly associated with
 * Cross-Site Scripting payloads (script tags, inline event handlers,
 * javascript: URIs, encoded variants, etc).
 *
 * NOTE (Phase 2 scaffolding): `xssPatterns` is currently empty, so `scan()`
 * always returns `malicious: false`. Real signatures + tests land in Phase 3,
 * same as SQLInjectionDetector.
 */
class XSSDetector {
  /**
   * Tests a single field's value against every XSS pattern.
   * Exposed so SecurityEngine can run a shared field-by-field pass while
   * preserving the same single-source-of-truth logic for both detectors.
   *
   * @param {string} value
   * @returns {string|null} the source of the first matching pattern, or null
   */
  static testField(value) {
    for (const pattern of xssPatterns) {
      if (pattern.test(value)) {
        return pattern.source;
      }
    }
    return null;
  }

  /**
   * @param {object} normalizedRequest - output of RequestInspector.extract()
   * @returns {{ malicious: boolean, matchedPattern: string|null, field: string|null }}
   */
  static scan(normalizedRequest) {
    for (const [field, value] of Object.entries(normalizedRequest.fields)) {
      const matchedPattern = this.testField(value);
      if (matchedPattern) {
        return { malicious: true, matchedPattern, field };
      }
    }

    return { malicious: false, matchedPattern: null, field: null };
  }
}

module.exports = XSSDetector;