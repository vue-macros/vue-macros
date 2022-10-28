export type Foo = 'foo'
export type Str = string
export type Num = number
export * as Bar from './bar'

export namespace NSFoo {
  export type Foo = boolean
}
