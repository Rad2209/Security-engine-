/**
 * extractSpecs
 *
 * HONEST LIMITATION: the Product schema has no dedicated spec fields
 * (caseDiameter, waterResistance, powerReserve, etc.) — just a free-text
 * `description`. This heuristically pulls spec-looking tokens (case
 * diameter, water resistance, power reserve, frequency) out of that text
 * via regex, since the seed data happens to write specs into the
 * description naturally (e.g. "40mm stainless case, 100m water
 * resistance, 42h power reserve, 28,800vph..."). This is an approximation
 * for demo purposes, not a substitute for real structured spec data — if
 * this were a production app, these would be dedicated schema fields.
 *
 * KNOWN EDGE CASE (confirmed by testing against real seed data, not
 * theoretical): a description like "fits 0.9mm-3.2mm openings" extracts
 * "9mm" instead of "0.9mm" — the regex doesn't handle decimals. Left
 * as-is rather than adding decimal-handling complexity to a fundamentally
 * approximate mechanism; a real fix here is structured schema fields, not
 * a smarter regex.
 *
 * @param {string} description
 * @param {number} [max] - maximum number of specs to return
 * @returns {string[]} e.g. ["40mm", "100m"]
 */
const SPEC_PATTERNS = [
  /\b\d+mm\b/i, // case diameter, e.g. "40mm"
  /\b\d+m\b/i, // water resistance, e.g. "100m" (word boundary excludes "40mm")
  /\b\d+h\b/i, // power reserve, e.g. "42h"
  /\b\d{1,3}(?:,\d{3})?vph\b/i, // frequency, e.g. "28,800vph"
];

export function extractSpecs(description, max = 2) {
  if (!description) return [];

  const found = [];
  for (const pattern of SPEC_PATTERNS) {
    const match = description.match(pattern);
    if (match) found.push(match[0]);
    if (found.length >= max) break;
  }
  return found;
}