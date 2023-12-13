<script setup lang="ts">
type ShortEmits = {
  click: []
}

const emit = defineEmits<ShortEmits>()
</script>

<template>
  <button @click="emit('click')">click</button>
</template>
