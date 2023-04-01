<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { ComputedRef } from 'vue'
import type { Qux } from './types'

const foo = defineProp<string>('foo')
expectTypeOf(foo).toEqualTypeOf<ComputedRef<string>>()

const bar = defineProp<string>('bar', {
  type: String,
  required: true,
  default: 'bar',
})
expectTypeOf(bar).toEqualTypeOf<ComputedRef<string>>()

const baz = defineProp<string | number>('baz', {
  required: true,
  default: () => [1, 2, 3],
})
expectTypeOf(baz).toEqualTypeOf<ComputedRef<string | number>>()

defineProp<Qux>('qux')

defineProp<boolean>('quux', { default: true })

// infer prop name from variable name
const quuz = defineProp()
console.log(quuz)
</script>
