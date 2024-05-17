<script setup lang="ts" generic="T">
import { Ok } from '../../../assert'

let { title } = $defineModels<{
  title: string
}>()

const update = () => {
  title += '!'
}
</script>

<template>
  <fieldset>
    <legend>$defineModels</legend>
    <button @click="update">Update</button>
    <Ok />
    <div>current value: {{ title }}</div>
  </fieldset>
</template>
