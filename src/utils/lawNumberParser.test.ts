import { describe, it, expect } from 'vitest';
import { parseLawNumber, buildLawNumber } from './lawNumberParser';

describe('parseLawNumber', () => {
  it('should parse Reiwa era law number', () => {
    const result = parseLawNumber('令和五年法律第十号');
    expect(result).toEqual({
      era: '令和',
      year: '五',
      type: '法律',
      number: '十',
    });
  });

  it('should parse Heisei era law number', () => {
    const result = parseLawNumber('平成三十年政令第百二十三号');
    expect(result).toEqual({
      era: '平成',
      year: '三十',
      type: '政令',
      number: '百二十三',
    });
  });

  it('should parse Showa era law number', () => {
    const result = parseLawNumber('昭和二十五年法律第一号');
    expect(result).toEqual({
      era: '昭和',
      year: '二十五',
      type: '法律',
      number: '一',
    });
  });

  it('should parse Taisho era law number', () => {
    const result = parseLawNumber('大正十年勅令第五号');
    expect(result).toEqual({
      era: '大正',
      year: '十',
      type: '勅令',
      number: '五',
    });
  });

  it('should parse Meiji era law number', () => {
    const result = parseLawNumber('明治三十年法律第八十九号');
    expect(result).toEqual({
      era: '明治',
      year: '三十',
      type: '法律',
      number: '八十九',
    });
  });

  it('should parse law number with complex kanji numbers', () => {
    const result = parseLawNumber('令和二年法律第千二百三十四号');
    expect(result).toEqual({
      era: '令和',
      year: '二',
      type: '法律',
      number: '千二百三十四',
    });
  });

  it('should parse law number with cabinet order', () => {
    const result = parseLawNumber('令和一年政令第一号');
    expect(result).toEqual({
      era: '令和',
      year: '一',
      type: '政令',
      number: '一',
    });
  });

  it('should parse law number with ministry ordinance', () => {
    const result = parseLawNumber('令和三年総務省令第十五号');
    expect(result).toEqual({
      era: '令和',
      year: '三',
      type: '総務省令',
      number: '十五',
    });
  });

  it('should parse law number with rules', () => {
    const result = parseLawNumber('令和四年人事院規則第二号');
    expect(result).toEqual({
      era: '令和',
      year: '四',
      type: '人事院規則',
      number: '二',
    });
  });

  it('should return null for undefined input', () => {
    const result = parseLawNumber(undefined);
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = parseLawNumber('');
    expect(result).toBeNull();
  });

  it('should return null for invalid format', () => {
    const result = parseLawNumber('これは法令番号ではありません');
    expect(result).toBeNull();
  });

  it('should return null for incomplete law number', () => {
    const result = parseLawNumber('令和五年法律');
    expect(result).toBeNull();
  });

  it('should return null for law number without era', () => {
    const result = parseLawNumber('五年法律第十号');
    expect(result).toBeNull();
  });

  it('should return null for law number without year', () => {
    const result = parseLawNumber('令和法律第十号');
    expect(result).toBeNull();
  });

  it('should return null for law number without type', () => {
    const result = parseLawNumber('令和五年第十号');
    expect(result).toBeNull();
  });

  it('should return null for law number without number', () => {
    const result = parseLawNumber('令和五年法律第');
    expect(result).toBeNull();
  });
});

describe('buildLawNumber', () => {
  it('should build law number from all fields', () => {
    const result = buildLawNumber({
      era: '令和',
      year: '五',
      type: '法律',
      number: '十',
    });
    expect(result).toBe('令和五年法律第十号');
  });

  it('should build law number with cabinet order', () => {
    const result = buildLawNumber({
      era: '平成',
      year: '三十',
      type: '政令',
      number: '百二十三',
    });
    expect(result).toBe('平成三十年政令第百二十三号');
  });

  it('should build law number with ministry ordinance', () => {
    const result = buildLawNumber({
      era: '令和',
      year: '三',
      type: '総務省令',
      number: '十五',
    });
    expect(result).toBe('令和三年総務省令第十五号');
  });

  it('should return empty string if era is missing', () => {
    const result = buildLawNumber({
      year: '五',
      type: '法律',
      number: '十',
    });
    expect(result).toBe('');
  });

  it('should return empty string if year is missing', () => {
    const result = buildLawNumber({
      era: '令和',
      type: '法律',
      number: '十',
    });
    expect(result).toBe('');
  });

  it('should return empty string if type is missing', () => {
    const result = buildLawNumber({
      era: '令和',
      year: '五',
      number: '十',
    });
    expect(result).toBe('');
  });

  it('should return empty string if number is missing', () => {
    const result = buildLawNumber({
      era: '令和',
      year: '五',
      type: '法律',
    });
    expect(result).toBe('');
  });

  it('should return empty string if all fields are missing', () => {
    const result = buildLawNumber({});
    expect(result).toBe('');
  });

  it('should return empty string if era is empty', () => {
    const result = buildLawNumber({
      era: '',
      year: '五',
      type: '法律',
      number: '十',
    });
    expect(result).toBe('');
  });

  it('should return empty string if year is empty', () => {
    const result = buildLawNumber({
      era: '令和',
      year: '',
      type: '法律',
      number: '十',
    });
    expect(result).toBe('');
  });

  it('should return empty string if type is empty', () => {
    const result = buildLawNumber({
      era: '令和',
      year: '五',
      type: '',
      number: '十',
    });
    expect(result).toBe('');
  });

  it('should return empty string if number is empty', () => {
    const result = buildLawNumber({
      era: '令和',
      year: '五',
      type: '法律',
      number: '',
    });
    expect(result).toBe('');
  });
});

describe('parseLawNumber and buildLawNumber integration', () => {
  it('should round-trip law numbers correctly', () => {
    const testCases = [
      '令和五年法律第十号',
      '平成三十年政令第百二十三号',
      '昭和二十五年法律第一号',
      '大正十年勅令第五号',
      '明治三十年法律第八十九号',
      '令和一年内閣府令第一号',
      '令和三年総務省令第十五号',
      '令和四年人事院規則第二号',
    ];

    testCases.forEach((lawNum) => {
      const parsed = parseLawNumber(lawNum);
      expect(parsed).not.toBeNull();
      if (parsed) {
        const rebuilt = buildLawNumber(parsed);
        expect(rebuilt).toBe(lawNum);
      }
    });
  });
});