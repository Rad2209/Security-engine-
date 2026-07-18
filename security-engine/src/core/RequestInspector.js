/**
 * RequestInspector
 *
 * Pulls the scannable parts of an Express request into one flat, normalized
 * object so detectors don't each need to know how to walk req.body vs.
 * req.query vs. req.params separately.
 *
 * Nested objects/arrays are flattened into dot-notation keys (e.g.
 * "address.street") so a payload buried in a nested JSON body is still
 * visible to the detectors as a plain string value.
 */
class RequestInspector {
  /**
   * @param {import('express').Request} req
   * @returns {{ ip: string, path: string, method: string, fields: Record<string, string> }}
   */
  static extract(req) {
    const fields = {};

    this._flatten(req.body, 'body', fields);
    this._flatten(req.query, 'query', fields);
    this._flatten(req.params, 'params', fields);

    return {
      ip: this._resolveIp(req),
      path: req.path,
      method: req.method,
      fields,
    };
  }

  /**
   * Resolves client IP, preferring X-Forwarded-For when running behind a
   * proxy/load balancer (true on Render) — falls back to req.ip otherwise.
   */
  static _resolveIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // X-Forwarded-For can be a comma-separated list; the first entry is
      // the original client.
      return forwarded.split(',')[0].trim();
    }
    return req.ip;
  }

  /**
   * Recursively flattens an object into `fields`, using dot-notation keys
   * prefixed by `prefix`. Non-string primitives are coerced to strings so
   * every detector only ever deals with strings.
   */
  static _flatten(obj, prefix, fields) {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      const flatKey = `${prefix}.${key}`;

      if (value && typeof value === 'object') {
        this._flatten(value, flatKey, fields);
      } else if (value !== undefined && value !== null) {
        fields[flatKey] = String(value);
      }
    }
  }
}

module.exports = RequestInspector;