/**
 * Logger
 *
 * Builds a structured attack log entry and persists it via the
 * storageAdapter. Also fires the optional `onBlock` hook (e.g. for
 * real-time admin dashboard pushes) if the host app configured one.
 *
 * Payloads are truncated before storage/display — logs are for triage, not
 * for replaying the exact attack string indefinitely.
 */
const MAX_SNIPPET_LENGTH = 200;

class Logger {
  /**
   * @param {{
   *   type: 'SQL_INJECTION'|'XSS'|'BRUTE_FORCE',
   *   ip: string,
   *   endpoint: string,
   *   method: string,
   *   payload: string,
   *   severity: 'low'|'medium'|'high',
   *   blocked: boolean
   * }} details
   * @param {import('../storage/StorageAdapter')} storageAdapter
   * @param {Function|null} onBlock
   */
  static async log(details, storageAdapter, onBlock) {
    const entry = {
      type: details.type,
      ip: details.ip,
      endpoint: details.endpoint,
      method: details.method,
      payloadSnippet: this._truncate(details.payload),
      severity: details.severity,
      blocked: details.blocked,
      timestamp: new Date(),
    };

    await storageAdapter.saveAttackLog(entry);

    if (typeof onBlock === 'function') {
      // Fire-and-forget: a broken notification hook should never crash
      // the request-handling path.
      try {
        onBlock(entry);
      } catch (err) {
        // Intentionally swallowed — see comment above. Host apps should
        // add their own error handling inside the hook if they care.
      }
    }

    return entry;
  }

  static _truncate(payload) {
    if (!payload) return '';
    const str = String(payload);
    return str.length > MAX_SNIPPET_LENGTH
      ? `${str.slice(0, MAX_SNIPPET_LENGTH)}...(truncated)`
      : str;
  }
}

module.exports = Logger;