<script lang="ts" setup>
import { ref } from 'vue'

defineProps<{
  title: string
  unit: string
  unitIsRight?: boolean
}>()

const count = ref(0)
</script>

<template name="unit">
  <span class="unit">
    <slot name="unit">{{ count }} {{ unit }}</slot>
  </span>
</template>

<template>
  <div>
    <template v-if="!unitIsRight">
      <template is="unit" />
    </template>

    <span>{{ title }}</span>

    <template v-if="unitIsRight">
      <template is="unit" />
    </template>

    <br />
    <template is="unit" />
  </div>
</template>

<style scoped>
.unit {
  color: red;
}
</style>
