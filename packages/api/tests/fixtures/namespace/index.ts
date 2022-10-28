import * as foo from './foo'
import { NestedNS } from './nested'

module NS {
  export type Bar = string
}

export type Str = foo.Str
export type Num = foo.Num
export type Foo = foo.Foo
export type BarStr = foo.Bar.Str
export type NSFoo = foo.NSFoo.Foo
export type NSBar = NS.Bar
export type NestedNestedFoo = NestedNS.NestedNS2.NestedNS3.Foo
