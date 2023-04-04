export function removeSpaces(s: string) {
  return s
    .trim()
    .replace(/[\n\r]/g, '')
    .replace(/\s+/g, ' ')
}
