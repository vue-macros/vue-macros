<script setup lang="ts">
import { Ok } from '../../assert'

const key1 = 'title'
const key2 = `title${2}`
const key3 = /* hoist-static */ (() => 'foo')()
defineProps([key1, key2, key3])
</script>

<template>
  <Ok />
</template>
