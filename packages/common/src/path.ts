/**
 * Converts path separators to forward slash.
 */
export function normalizePath(filename: string): string {
  return filename.replaceAll('\\', '/')
}
