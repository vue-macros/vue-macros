export function removeSpaces(s: string) {
  return s
    .trim()
    .replaceAll(/[\n\r]/g, '')
    .replaceAll(/\s+/g, ' ')
}
