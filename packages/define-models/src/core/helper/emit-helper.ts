import { type SetupContext } from 'vue'

// eslint-disable-next-line import/no-default-export
export default (
  emitFn: SetupContext['emit'],
  key: string,
  value: unknown,
  ...args: unknown[]
) => {
  emitFn(key, value)
  return args.length > 0 ? args[0] : value
}
