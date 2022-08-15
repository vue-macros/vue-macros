<script setup lang="ts">
import Counter from './Counter.setup'

const name = 'AppDemo'
defineOptions({
  name,
})

const count = $ref(0)

const handleChange = () => {
  // eslint-disable-next-line no-console
  console.log('changed')
}
</script>

<template>
  <h1>Hello</h1>
  <Counter v-model="count" @change="handleChange" />
</template>
