<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { ComputedRef } from 'vue'
import type { Qux } from './types'

// defineProp(prop_name)
const foo = defineProp<string>('foo')
expectTypeOf(foo).toEqualTypeOf<ComputedRef<string>>()

// defineProp(prop_name, options)
const bar = defineProp<string>('bar', {
  type: String,
  required: true,
  default: 'bar',
})
expectTypeOf(bar).toEqualTypeOf<ComputedRef<string>>()

// defineProp(prop_name, options)
const baz = defineProp<string | number>('baz', {
  required: true,
  default: () => [1, 2, 3],
})
expectTypeOf(baz).toEqualTypeOf<ComputedRef<string | number>>()

// defineProp(prop_name)
defineProp<Qux>('qux')

// defineProp(prop_name, options)
defineProp<boolean>('quux', { default: true })

// infer prop name from variable name
// const prop_name = defineProp()
const quuz = defineProp()
expectTypeOf(quuz).toEqualTypeOf<ComputedRef<any>>()
console.log(quuz)
</script>
