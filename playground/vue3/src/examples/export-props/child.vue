<!-- eslint-disable import/no-mutable-exports -->
<!-- eslint-disable @typescript-eslint/no-inferrable-types -->
<script setup lang="ts">
import { Assert } from '../../assert'

export let foo: string
export const bar: number = 10

// eslint-disable-next-line prefer-const
foo = 'bar'
</script>

<template>
  <Assert :l="foo" r="bar" />
  <Assert :l="bar" :r="10" />
</template>
