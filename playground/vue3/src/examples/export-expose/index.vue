<script setup lang="ts">
import { ref } from 'vue'
import { Assert } from '../../assert'
import ChildGeneric from './child-generic.vue'
import Child from './child.vue'

const child = ref<InstanceType<typeof Child>>()
const childGeneric = ref<ComponentExposed<typeof Child>>()
</script>

<template>
  <Child ref="child" />
  <ChildGeneric ref="childGeneric" />
  <Assert :l="child?.foo" r="new" />
  <Assert :l="childGeneric?.bar" r="bar" />
</template>
