export * from './foo'
export type Bar = 'bar'

// @ts-expect-error
export type A = B
// @ts-expect-error
export type B = A
