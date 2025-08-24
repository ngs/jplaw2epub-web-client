import { describe, it, expect } from "vitest";
import { convertToKanji } from "./convertToKanji";

describe("convertToKanji", () => {
  it("should convert half-width numbers to kanji", () => {
    expect(convertToKanji("1")).toBe("一");
    expect(convertToKanji("10")).toBe("十");
    expect(convertToKanji("12")).toBe("十二");
    expect(convertToKanji("20")).toBe("二十");
    expect(convertToKanji("99")).toBe("九十九");
    expect(convertToKanji("100")).toBe("百");
    expect(convertToKanji("123")).toBe("百二十三");
    expect(convertToKanji("1000")).toBe("千");
    expect(convertToKanji("2025")).toBe("二千二十五");
  });

  it("should convert full-width numbers to kanji", () => {
    expect(convertToKanji("１")).toBe("一");
    expect(convertToKanji("１０")).toBe("十");
    expect(convertToKanji("２０２５")).toBe("二千二十五");
  });

  it("should return the input if already in kanji", () => {
    expect(convertToKanji("一")).toBe("一");
    expect(convertToKanji("十")).toBe("十");
    expect(convertToKanji("百二十三")).toBe("百二十三");
  });

  it("should handle empty string", () => {
    expect(convertToKanji("")).toBe("");
  });

  it("should handle invalid input", () => {
    expect(convertToKanji("abc")).toBe("abc");
    expect(convertToKanji("test123")).toBe("test123");
  });
});
