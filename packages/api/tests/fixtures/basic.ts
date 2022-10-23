import { Foo } from './exported'

type Str = string
export type { Str }
export type { Str as StrAlias }

export type Num = number

export interface Inferface {
  foo: 'foo'
}

export type { Foo }
export type { Foo as FooAlias }
export { Test as OuterTest } from './export-all'
// export * from './export-all'
