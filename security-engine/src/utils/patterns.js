/**
 * patterns.js
 *
 * Signature libraries for SQLInjectionDetector and XSSDetector.
 *
 * DESIGN PRINCIPLE: match on suspicious *combinations* of tokens (e.g.
 * "OR 1=1", "UNION SELECT"), never on a single common character (a bare
 * quote or angle bracket). Single-character matching is what causes
 * legitimate input like "O'Brien" or "5 < 10" to be wrongly flagged.
 *
 * KNOWN LIMITATION (documented, not hidden): signature/regex-based detection
 * can be evaded by sufficiently obfuscated or encoded payloads (e.g. mixed
 * casing tricks, comment-splitting, double URL-encoding, unicode
 * normalization tricks). This is a deliberate scope boundary for this
 * project — see the project write-up's "Future Work" section. A production
 * system would layer this with a WAF, parameterized-query enforcement, and/or
 * anomaly-based detection.
 */

const sqlInjectionPatterns = [
  // Tautology-based auth bypass: ' OR 1=1--, " OR "a"="a, OR 1=1#
  /(\bor\b|\band\b)\s+[\'"]?\w+[\'"]?\s*=\s*[\'"]?\w+[\'"]?/i,

  // UNION-based injection
  /\bunion\b(\s+all)?\s+\bselect\b/i,

  // Classic SELECT ... FROM data exfiltration structure. Requires at least
  // one token (a column name or *) between the keywords — this is what
  // stops ordinary UI copy like "select from the dropdown menu" from
  // false-positiving, since real SQL always has a column list in between.
  /\bselect\b\s+\S+.*\bfrom\b/i,

  // INSERT / UPDATE / DELETE tampering
  /\binsert\b\s+\binto\b.+\bvalues\b/i,
  /\bupdate\b\s+\w+\s+\bset\b/i,
  /\bdelete\b\s+\bfrom\b\s+\w+/i,

  // Destructive stacked queries: "; DROP TABLE users"
  /;\s*(drop|delete|insert|update|alter|truncate)\b/i,
  /\bdrop\b\s+(table|database)\b/i,

  // SQL comment terminators used to truncate a query: ' --  or  '#
  /[\'"]\s*(--|#)/,

  // Time-based blind SQLi
  /\bsleep\s*\(\s*\d+\s*\)/i,
  /\bbenchmark\s*\(\s*\d+/i,

  // Stored-procedure / command execution abuse (common in MSSQL attacks)
  /\bexec\b(\s|\()+\s*(xp_|sp_)\w+/i,

  // information_schema probing (common reconnaissance step)
  /information_schema/i,
];

const xssPatterns = [
  // <script> tags, opening or closing
  /<script[\s>]/i,
  /<\/script\s*>/i,

  // javascript: URI scheme (e.g. in an href or img src)
  /javascript\s*:/i,

  // Inline event handler injection: onerror=, onload=, onclick=, etc.
  /\bon\w+\s*=\s*["']?[^"'>]*/i,

  // Common tag-based vectors used to smuggle event handlers
  /<img[^>]+onerror/i,
  /<svg[^>]+onload/i,
  /<body[^>]+onload/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,

  // Direct script-API abuse often paired with the above vectors
  /document\.cookie/i,
  /eval\s*\(/i,
];

module.exports = { sqlInjectionPatterns, xssPatterns };