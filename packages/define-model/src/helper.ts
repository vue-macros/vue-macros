export function emitHelper(
  emitFn: (evt: string, ...args: any[]) => void,
  key: string,
  value: unknown,
  ...args: [returnValue?: unknown]
) {
  emitFn(key, value)
  return args.length > 0 ? args[0] : value
}
