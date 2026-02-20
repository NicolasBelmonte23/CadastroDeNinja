/**
 * Format cents to BRL currency string.
 * @param {number} cents - Amount in cents (integer)
 * @returns {string} e.g. "R$ 12,50"
 */
export function formatBRL(cents) {
  const value = (cents / 100).toFixed(2).replace('.', ',');
  return `R$ ${value}`;
}

/**
 * Format a phone string for display.
 * @param {string} phoneE164 e.g. "+5551985079395"
 * @returns {string} e.g. "(51) 98507-9395"
 */
export function formatPhone(phoneE164) {
  if (!phoneE164) return '';
  const digits = phoneE164.replace(/\D/g, '');
  // Brazilian phone: 55 + DDD(2) + number(8-9)
  if (digits.length >= 12) {
    const ddd = digits.slice(2, 4);
    const num = digits.slice(4);
    if (num.length === 9) {
      return `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
    }
    return `(${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
  }
  return phoneE164;
}
