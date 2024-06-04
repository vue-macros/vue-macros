<script setup lang="ts">
import { defineProps } from 'unplugin-vue-macros/macros' with { type: 'macro' }
import { Assert } from '../../assert'

defineProps<{
  foo?: string
  bar?: boolean
}>().withDefaults({
  foo: 'foo',
})
</script>

<template>
  <div>
    <Assert :l="foo" r="foo" />
    <Assert :l="bar" :r="false" />
  </div>
</template>
