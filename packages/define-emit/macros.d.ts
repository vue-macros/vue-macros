type MaybeTupleFunction<T, R> = T extends any[]
  ? (...args: T) => R
  : T extends (...args: any) => any
  ? (...args: Parameters<T>) => R
  : T

export declare function defineEmit<
  T extends ((...args: any) => any) | any[] = any[]
>(
  emitName?: string,
  validator?: MaybeTupleFunction<T, any>
): MaybeTupleFunction<T, void>
