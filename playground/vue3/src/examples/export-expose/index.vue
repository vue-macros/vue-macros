<script setup lang="ts">
import { ref } from 'vue'
import { Assert } from '../../assert'
import Child from './child.vue'
import ChildGeneric from './child-generic.vue'

const child = ref<InstanceType<typeof Child>>()
const childGeneric = ref<ComponentExposed<typeof Child>>()
</script>

<template>
  <Child ref="child" />
  <ChildGeneric ref="childGeneric" />
  <Assert :l="child?.foo" r="new" />
  <Assert :l="childGeneric?.bar" r="bar" />
</template>
