const SQLInjectionDetector = require('../src/detectors/SQLInjectionDetector');

/**
 * Helper to build a fake "normalized request" shape, matching what
 * RequestInspector.extract() would produce, so we can test the detector
 * without needing a real Express req object.
 */
function normalized(fields) {
  return { ip: '127.0.0.1', path: '/api/test', method: 'GET', fields };
}

describe('SQLInjectionDetector — true positives (should be flagged malicious)', () => {
  const attackPayloads = [
    ["' OR 1=1--", 'tautology auth bypass'],
    ["' OR '1'='1", 'quoted tautology'],
    ["admin' --", 'comment-terminated login bypass'],
    ["1 UNION SELECT username, password FROM users", 'UNION-based exfiltration'],
    ["'; DROP TABLE users; --", 'stacked destructive query'],
    ["1; DELETE FROM orders", 'stacked delete'],
    ["' AND SLEEP(5)--", 'time-based blind SQLi'],
    ["1 OR BENCHMARK(10000000,MD5('a'))", 'benchmark-based blind SQLi'],
    ["'; EXEC xp_cmdshell('dir'); --", 'stored-procedure abuse'],
    ["' UNION SELECT table_name FROM information_schema.tables--", 'schema reconnaissance'],
    ["' OR 'x'='x", 'alphabetic tautology'],
    ["1' AND 1=1 UNION SELECT null, null--", 'combined union+tautology'],
  ];

  test.each(attackPayloads)('flags payload: %s (%s)', (payload) => {
    const result = SQLInjectionDetector.scan(normalized({ 'body.search': payload }));
    expect(result.malicious).toBe(true);
  });
});

describe('SQLInjectionDetector — true negatives (should NOT be flagged)', () => {
  const legitimateInputs = [
    ["O'Brien", 'surname with apostrophe'],
    ["Men's T-Shirt - Large", 'product name with apostrophe'],
    ["it's a great product, highly recommend!", 'review text with apostrophe'],
    ["laptop stand", 'normal search term'],
    ["user@example.com", 'email address'],
    ["I ordered 2 items and got 1", 'ordinary sentence with digits'],
    ["Please select from the dropdown menu", 'ordinary sentence containing the words select/from separately'],
    ["Update: my order arrived today, thanks!", 'ordinary sentence containing the word update'],
    ["", 'empty string'],
    ["1234567890", 'plain numeric string (e.g. phone number)'],
  ];

  test.each(legitimateInputs)('does NOT flag: %s (%s)', (value) => {
    const result = SQLInjectionDetector.scan(normalized({ 'body.field': value }));
    expect(result.malicious).toBe(false);
  });
});

describe('SQLInjectionDetector — reports which field triggered it', () => {
  test('identifies the offending field name', () => {
    const result = SQLInjectionDetector.scan(
      normalized({
        'body.name': 'John Doe',
        'query.search': "' OR 1=1--",
      })
    );
    expect(result.malicious).toBe(true);
    expect(result.field).toBe('query.search');
  });
});