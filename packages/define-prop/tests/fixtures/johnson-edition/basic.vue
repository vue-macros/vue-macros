<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { type ComputedRef } from 'vue'

// defineProp()
const qux = defineProp<string>()
expectTypeOf(qux).toEqualTypeOf<ComputedRef<string | undefined>>()

// defineProp(value)
const foo = defineProp<string>('foo')
expectTypeOf(foo).toEqualTypeOf<ComputedRef<string>>()

// defineProp(value, required)
const bar = defineProp('bar', false)
expectTypeOf(bar).toEqualTypeOf<ComputedRef<string>>()

// defineProp(value, required, rest)
const baz = defineProp<string>('bar', false, { validator: () => true })
expectTypeOf(baz).toEqualTypeOf<ComputedRef<string>>()

// unknown type
const unknownType = defineProp<unknown | boolean>()

const $bar = $defineProp('bar', true)
const $baz = $(defineProp('baz'))
</script>
