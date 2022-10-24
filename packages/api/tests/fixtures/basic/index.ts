import { Base1, Base2, Foo } from './exported'

type Str = string
export type { Str }
export type { Str as StrAlias }

export type Num = number

export interface Inferface extends Base1, Base2 {
  foo: 'foo'
}

export { Foo }
export type { Foo as FooAlias }
export { Test as OuterTest } from './export-all'
export * from './export-all'
