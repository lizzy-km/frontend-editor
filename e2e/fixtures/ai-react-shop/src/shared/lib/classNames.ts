type ClassPart = string | false | null | undefined;

// Joins class names and skips the ones that are empty or switched off.
export function cx(...parts: ClassPart[]): string {
  return parts.filter(Boolean).join(" ");
}
