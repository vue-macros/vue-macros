<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import type { ComputedRef } from 'vue'
import { defineProp } from '../../../macros-johnson'

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

// @ts-expect-error reactivity transform
const $bar = $defineProp('bar', true)
const $baz = $(defineProp('baz'))
</script>
