<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import { Assert } from '../../assert'
import Empty from './empty.vue'
import Tsx from './tsx.vue'
import { Assert } from '../../assert'

defineOptions({
  name: 'ExampleDefineOptions',
  inheritAttrs: false,
})

const vm = getCurrentInstance()!
</script>

<template>
  <div>
    basic
    <Assert :l="vm.type.name" r="ExampleDefineOptions" />
    <Assert :l="vm.type.inheritAttrs" :r="false" />
  </div>

  <empty />
  <tsx />
</template>
