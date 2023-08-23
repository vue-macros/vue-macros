<script setup lang="ts">
import { Assert } from '../../assert'
const foo = defineProp<string>('foo')
const bar = $(defineProp<string>())

definePropsRefs(['msg'])
</script>

<template>
  <div>foo: {{ foo }}</div>
  <div>
    <Assert :l="bar" r="bar" />
    <Assert :l="'msg' in $props" :r="true" />
  </div>
</template>
