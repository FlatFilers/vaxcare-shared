import * as chrono from "chrono-node";

export function asDate(input: any): Date | null {
  const str_value = asString(input);
  if (!str_value) {
    return null;
  }
  return chrono.parseDate(str_value);
}
export function asNumber(input: any): number {
  // Handle direct number input
  if (typeof input === "number" && !isNaN(input)) {
    return input;
  }

  // Handle null, undefined, empty strings, and non-string/non-number types
  if (!input || (typeof input !== "string" && typeof input !== "number")) {
    return 0;
  }

  // Convert to string and trim
  const trimmedInput = input.toString().trim();
  if (!trimmedInput) return 0;

  // Try direct conversion first (handles scientific notation automatically)
  const directNum = Number(trimmedInput);
  if (!isNaN(directNum)) return directNum;

  // Remove thousand separators and try again
  const withoutSeparators = trimmedInput.replace(/,/g, "");
  const numWithoutSeparators = Number(withoutSeparators);
  if (!isNaN(numWithoutSeparators)) return numWithoutSeparators;

  // Handle percentages
  if (trimmedInput.endsWith("%")) {
    const percentValue = Number(trimmedInput.slice(0, -1));
    if (!isNaN(percentValue)) {
      // Round to 12 decimal places to maintain high precision while avoiding floating point artifacts
      return Math.round((percentValue / 100) * 1e12) / 1e12;
    }
  }

  // Handle currency values
  const currencyRegex = /^[^\d\s-]*\s*-?\d+(?:,\d{3})*(?:\.\d{1,2})?$/;
  if (currencyRegex.test(trimmedInput)) {
    const numericValue = trimmedInput.replace(/[^\d.-]/g, "");
    const currencyNum = Number(numericValue);
    if (!isNaN(currencyNum)) return currencyNum;
  }

  // Return 0 if no conversion was successful
  return 0;
}

export function asString(input: any): string {
  // Check if the input is null or undefined
  if (input === null || input === undefined) {
    return "";
  }

  // Check if the input is an object or an array (excluding null, which is technically an object in JS)
  if (typeof input === "object") {
    // Attempt to convert objects and arrays to a JSON string
    try {
      return JSON.stringify(input);
    } catch (error) {
      // In case of circular references or other JSON.stringify errors, return a fallback string
      return "[object]";
    }
  }

  // For numbers, booleans, and other types, convert directly to string
  return String(input);
}

export function asNullableString(input: any): string | undefined {
  // Check if the input is null or undefined
  if (input === null || input === undefined || input === "undefined" || input === "null" || input === "") {
    return undefined;
  }

  return asString(input);
}

export function asBool(input: any): boolean {
  // todo: make this way smarter soon
  return !!input;
}
