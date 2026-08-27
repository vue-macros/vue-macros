import { expectTypeOf } from 'expect-type'
import { $defineProp, defineProp } from '../../../macros'
import type { ComputedRef } from 'vue'

expectTypeOf(defineProp<string>('foo')).toEqualTypeOf<
  ComputedRef<string | undefined>
>()
expectTypeOf(defineProp<string>('foo', { required: true })).toEqualTypeOf<
  ComputedRef<string>
>()
expectTypeOf($defineProp<string>('foo')).toEqualTypeOf<string | undefined>()
