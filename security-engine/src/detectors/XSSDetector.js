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
   * @param {object} normalizedRequest - output of RequestInspector.extract()
   * @returns {{ malicious: boolean, matchedPattern: string|null, field: string|null }}
   */
  static scan(normalizedRequest) {
    for (const [field, value] of Object.entries(normalizedRequest.fields)) {
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          return { malicious: true, matchedPattern: pattern.source, field };
        }
      }
    }

    return { malicious: false, matchedPattern: null, field: null };
  }
}

module.exports = XSSDetector;