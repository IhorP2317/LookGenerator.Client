export function cleanFilterPayload<T extends Record<number, any>>(
  filters: Partial<T>,
): Partial<T> {
  const cleaned: Partial<T> = {};

  for (const key in filters) {
    if (!filters.hasOwnProperty(key)) continue;

    const value = filters[key as keyof T];

    const isEmptyArray = Array.isArray(value) && value.length === 0;
    const isNullOrUndefined = value === null || value === undefined;

    if (!isNullOrUndefined && !isEmptyArray) {
      cleaned[key as keyof T] = value;
    }
  }

  return cleaned;
}
