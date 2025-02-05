export function findOrFail<T>(arr: T[] | undefined, key: (val: T) => any): T;
export function findOrFail<T>(arr: T[] | undefined, key: keyof T, val: any): T;
export function findOrFail<T>(arr: T[] | undefined, key: keyof T | ((val: T) => any), val?: any): T {
  const found = arr ? arr.find(typeof key === "function" ? key : (s) => s[key] === val) : false;
  if (!found) {
    throw new Error(`Could not find record in array with ${String(key)} matching ${val}`);
  }
  return found;
}
