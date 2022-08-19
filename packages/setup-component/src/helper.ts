export function emitHelper(
  emitFn: (evt: string, ...args: any[]) => void,
  key: string,
  value: unknown
) {
  emitFn(key, value)
  return value
}
