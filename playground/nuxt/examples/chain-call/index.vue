<script setup lang="ts">
import { defineProps } from 'unplugin-vue-macros' with { type: 'macro' }
import { Assert } from '../../assert'

defineProps<{
  foo?: string
  bar?: boolean
}>().withDefaults({
  foo: 'foo',
})
</script>

<template>
  <Assert :l="foo" r="foo" />
  <Assert :l="bar" :r="false" />
</template>
