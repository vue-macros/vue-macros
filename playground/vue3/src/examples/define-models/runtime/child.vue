<script setup lang="ts">
import { Ok } from '../../../assert'
import type { Props } from './types'

defineProps<Props>()

const { title, none } = defineModels<{
  title: string
  none?: ModelOptions<string, { defaultValue: 'initial value' }>
}>()

const update = () => {
  title.value += '!'
  none.value += '!'
}
</script>

<template>
  <fieldset>
    <legend>defineModels</legend>
    <button @click="update">Update</button>
    <Ok />
    <div>current value: {{ title }}</div>
    <div>none: {{ none }}</div>
  </fieldset>
</template>
