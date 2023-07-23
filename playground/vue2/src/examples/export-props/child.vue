<script setup lang="ts">
import { Assert } from '../../assert'

export let foo: string
export const bar: number = 10
</script>

<template>
  <div>
    <Assert :l="foo" r="foo" />
    <Assert :l="bar" :r="10" />
  </div>
</template>
