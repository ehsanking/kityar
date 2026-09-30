export const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts all Latin numerals (0-9) in any string or number to Persian numerals (۰-۹).
 */
export function toPersianDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  const str = String(input);
  return str.replace(/\d/g, (digit) => PERSIAN_DIGITS[parseInt(digit, 10)] || digit);
}

/**
 * Formats a number with Persian digits and an optional suffix (e.g., px, %, تومان).
 */
export function formatPersianNumber(num: number | string, suffix?: string): string {
  const pStr = toPersianDigits(num);
  return suffix ? `${pStr} ${suffix}` : pStr;
}

/**
 * Parses numbers from string, handling Persian digits as well.
 */
export function parsePersianDigits(input: string): number {
  if (!input) return 0;
  const englishStr = input.replace(/[۰-۹]/g, (char) =>
    String(PERSIAN_DIGITS.indexOf(char))
  );
  return parseFloat(englishStr) || 0;
}
