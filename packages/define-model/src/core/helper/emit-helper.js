export default (emitFn, key, value, ...args) => {
  emitFn(key, value)
  return args.length > 0 ? args[0] : value
}
