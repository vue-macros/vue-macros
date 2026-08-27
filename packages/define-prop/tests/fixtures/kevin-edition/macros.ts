import { expectTypeOf } from 'expect-type'
import {
  $defineProp as $definePropDirect,
  defineProp as definePropDirect,
} from '@vue-macros/define-prop/macros'
import {
  $defineProp as $definePropAggregate,
  defineProp as definePropAggregate,
} from 'vue-macros/macros'
import type { ComputedRef } from 'vue'

expectTypeOf(definePropDirect<string>('foo')).toEqualTypeOf<
  ComputedRef<string | undefined>
>()
expectTypeOf(definePropDirect<string>('foo', { default: 'foo' })).toEqualTypeOf<
  ComputedRef<string>
>()
expectTypeOf(
  definePropDirect<number>('count', { required: true }),
).toEqualTypeOf<ComputedRef<number>>()

expectTypeOf($definePropDirect<string>('foo')).toEqualTypeOf<
  string | undefined
>()
expectTypeOf(
  $definePropDirect<boolean>('disabled', { required: true }),
).toEqualTypeOf<boolean>()

// @ts-expect-error Johnson edition overloads are not part of the static default types.
definePropDirect('foo', true)

expectTypeOf(definePropAggregate<string>('foo')).toEqualTypeOf<
  ComputedRef<string | undefined>
>()
expectTypeOf($definePropAggregate<string>('foo')).toEqualTypeOf<
  string | undefined
>()

expectTypeOf(defineProp<string>('foo')).toEqualTypeOf<
  ComputedRef<string | undefined>
>()
expectTypeOf(defineProp<string>('foo', { required: true })).toEqualTypeOf<
  ComputedRef<string>
>()
expectTypeOf($defineProp<string>('foo')).toEqualTypeOf<string | undefined>()
expectTypeOf(
  $defineProp<string>('foo', { default: 'foo' }),
).toEqualTypeOf<string>()
