<script setup lang="ts">
import { computed } from 'vue'

const { foo, bar } = definePropsRefs<{
  foo: string
  bar: number
}>()

const baz = computed(() => foo.value)
</script>

<template>
  <div>bar: {{ bar }}, baz: {{ baz }}</div>
</template>
