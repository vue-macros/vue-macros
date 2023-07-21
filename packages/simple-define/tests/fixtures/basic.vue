<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { withDefaults } from '../../macros' assert { type: 'macro' }

const props = withDefaults(
  simpleProps<{
    msg?: string
    foo?: number | undefined
  }>(['msg', 'foo']),
  {
    msg: 'foo',
    foo: undefined as undefined | number,
  }
)

expectTypeOf<{
  msg: string
  foo: number | undefined
}>(props)

const emit = simpleEmits<{
  update: [msg: string]
}>(['update'])

emit('update', 'hello world')
</script>

<template>
  {{ msg }}
  <!-- boolean cast -->
  <Foo checked />
  <input type="checkbox" checked />
</template>
