import { asNumber } from "./casting";

describe("asNumber", () => {
  it("should handle direct number inputs", () => {
    expect(asNumber(42)).toBe(42);
    expect(asNumber(3.14)).toBe(3.14);
    expect(asNumber(-10)).toBe(-10);
  });

  it("should handle string number inputs", () => {
    expect(asNumber("42")).toBe(42);
    expect(asNumber("3.14")).toBe(3.14);
    expect(asNumber("-10")).toBe(-10);
    expect(asNumber("  42  ")).toBe(42);
  });

  it("should handle currency inputs", () => {
    expect(asNumber("$42")).toBe(42);
    expect(asNumber("$42.50")).toBe(42.5);
    expect(asNumber("€50.99")).toBe(50.99);
    expect(asNumber("£100")).toBe(100);
    expect(asNumber("$ 1,234.56")).toBe(1234.56);
  });

  it("should handle percentage inputs", () => {
    expect(asNumber("42%")).toBe(0.42);
    expect(asNumber("3.14%")).toBe(0.0314);
    expect(asNumber("-10%")).toBe(-0.1);
  });

  it("should handle scientific notation", () => {
    expect(asNumber("1e5")).toBe(100000);
    expect(asNumber("1.23e-4")).toBe(0.000123);
  });

  it("should handle number with thousand separators", () => {
    expect(asNumber("1,234")).toBe(1234);
    expect(asNumber("1,234,567.89")).toBe(1234567.89);
  });

  it("should handle special cases", () => {
    expect(asNumber(null)).toBe(0);
    expect(asNumber(undefined)).toBe(0);
    expect(asNumber("")).toBe(0);
    expect(asNumber("   ")).toBe(0);
    expect(asNumber({})).toBe(0);
    expect(asNumber([])).toBe(0);
    expect(asNumber("invalid")).toBe(0);
  });
});
