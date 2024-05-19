<script setup lang="ts" generic="T">
import { ref } from 'vue'
import { Ok } from '../../assert'
export const foo = ref('foo')
export const bar = 'bar'
</script>

<template>
  <Ok />
</template>
