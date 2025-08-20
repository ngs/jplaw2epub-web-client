/**
 * 法令番号のパース結果
 */
export interface ParsedLawNumber {
  era: string;      // 元号（例: "令和"）
  year: string;     // 年（漢数字のまま、例: "五"）
  type: string;     // 種別（例: "法律"）
  number: string;   // 号数（漢数字のまま、例: "十"）
}

/**
 * 法令番号を個別フィールドにパースする
 * @param lawNum - 法令番号文字列（例: "令和五年法律第十号"）
 * @returns パースされた法令番号の各要素、パースできない場合はnull
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
 * 個別フィールドから法令番号を組み立てる
 * @param fields - 法令番号の各フィールド
 * @returns 組み立てられた法令番号文字列、または空文字列
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