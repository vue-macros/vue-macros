export function removeSpaces(s: string): string {
  return s
    .trim()
    .replaceAll(/[\n\r]/g, '')
    .replaceAll(/\s+/g, ' ')
}
