/**
 * @param {number} amount
 * @param {string} [currency]
 * @returns {string} e.g. "$420.00"
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}