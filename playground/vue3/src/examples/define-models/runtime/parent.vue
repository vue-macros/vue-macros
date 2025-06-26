<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { ref } from 'vue'
import Child from './child.vue'

const title = ref('hello')
</script>

<template>
  <child
    v-model:title="title"
    @change="(value) => expectTypeOf<string>(value)"
  />
</template>
