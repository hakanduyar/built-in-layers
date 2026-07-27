type ClassValue = string | number | false | null | undefined;

/** Joins truthy class-name fragments with a single space. No dependency. */
export function cn(...values: ClassValue[]): string {
  return values.filter((value): value is string | number => Boolean(value)).join(" ");
}
