import { number2kanji } from "@geolonia/japanese-numeral";

/**
 * 数字を漢数字に変換する関数
 * @param input - 変換する文字列（半角数字、全角数字、または漢数字）
 * @returns 漢数字に変換された文字列
 */
export const convertToKanji = (input: string): string => {
  if (!input) return '';
  
  // 全角数字を半角に変換
  const num = input.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  
  // 既に漢数字の場合はそのまま返す
  if (/^[一二三四五六七八九十百千万億兆零]+$/.test(num)) {
    return num;
  }
  
  // 半角数字を漢数字に変換
  const number = parseInt(num, 10);
  if (isNaN(number)) return input;
  
  return number2kanji(number);
};