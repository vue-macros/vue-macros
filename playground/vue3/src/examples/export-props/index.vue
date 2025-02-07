<script setup lang="ts">
import { ref } from 'vue'
import { Assert } from '../../assert'
import Child from './child.vue'

const foo = ref('foo')
</script>

<template>
  <Child v-model:foo="foo" />
  <Assert :l="foo" r="bar" />
</template>
