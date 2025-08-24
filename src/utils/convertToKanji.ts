import { number2kanji } from "@geolonia/japanese-numeral";

/**
 * Convert numbers to kanji numerals
 * @param input - String to convert (half-width, full-width numbers, or kanji)
 * @returns String converted to kanji numerals
 */
export const convertToKanji = (input: string): string => {
  if (!input) return "";

  // Convert full-width numbers to half-width
  const num = input.replace(/[０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  );

  // Return as-is if already kanji numerals
  if (/^[一二三四五六七八九十百千万億兆零]+$/.test(num)) {
    return num;
  }

  // Convert half-width numbers to kanji numerals
  const number = parseInt(num, 10);
  if (isNaN(number)) return input;

  return number2kanji(number);
};
