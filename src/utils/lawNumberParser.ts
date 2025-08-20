/**
 * Parsed law number result
 */
export interface ParsedLawNumber {
  era: string;      // Era (e.g., "令和")
  year: string;     // Year (kept as kanji, e.g., "五")
  type: string;     // Type (e.g., "法律")
  number: string;   // Number (kept as kanji, e.g., "十")
}

/**
 * Parse law number into individual fields
 * @param lawNum - Law number string (e.g., "令和五年法律第十号")
 * @returns Parsed law number elements, or null if unable to parse
 */
export const parseLawNumber = (lawNum: string | undefined): ParsedLawNumber | null => {
  if (!lawNum) return null;

  const match = lawNum.match(
    /^(令和|平成|昭和|大正|明治)([一二三四五六七八九十百千万億兆零\d]+)年(.+?)第([一二三四五六七八九十百千万億兆零\d]+)号$/
  );

  if (!match) return null;

  return {
    era: match[1],
    year: match[2],
    type: match[3],
    number: match[4],
  };
};

/**
 * Build law number from individual fields
 * @param fields - Law number fields
 * @returns Built law number string, or empty string
 */
export const buildLawNumber = (fields: {
  era?: string;
  year?: string;
  type?: string;
  number?: string;
}): string => {
  const { era, year, type, number } = fields;
  
  if (!era || !year || !type || !number) {
    return "";
  }

  return `${era}${year}年${type}第${number}号`;
};