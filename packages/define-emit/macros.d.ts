export declare function defineEmit<T>(
  emitName: string,
  validataion?: (payload: T) => Boolean
): (payload?: T) => void
