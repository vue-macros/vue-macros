<script setup lang="ts">
import { expectTypeOf } from 'expect-type'

const foo = defineEmit('foo')
expectTypeOf(foo).toEqualTypeOf<(...args: any) => void>()

const bar = defineEmit('bar', (value: string) => typeof value === 'string')
expectTypeOf(bar).toEqualTypeOf<(value: string) => void>()

const baz = defineEmit<(value: number) => void>(
  'baz',
  (value) => typeof value === 'number'
)
expectTypeOf(baz).toEqualTypeOf<(value: number) => void>()
</script>
