<script setup lang="ts">
import { Assert } from '../../assert'

const { foo: fooAlias = 'fooAlias', bar: barAlias } = defineProps<{
  foo?: string
  bar?: number
}>()
</script>

<template>
  <div>
    <Assert :l="fooAlias" r="fooAlias" />
    <Assert :l="barAlias" :r="undefined" />
  </div>
</template>
