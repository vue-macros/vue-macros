declare module '*?raw' {
  const src: string
  export default src
}
interface ImportMeta {
  DEV: boolean
}

declare module 'make-synchronized' {
  type AwaitModule<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
      ? (...args: A) => Awaited<R>
      : T[K]
  }
  export function makeSynchronized<T>(module: URL): AwaitModule<T>
}
