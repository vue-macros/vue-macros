<script setup lang="tsx">
import { getCurrentInstance } from 'vue'
import { Assert } from '../../assert'

defineOptions({
  name: 'DemoDefineOptions',
  inheritAttrs: false,
})

const vm = getCurrentInstance()!
</script>

<template>
  <div>
    <span>TSX</span>
    <Assert :l="vm.type.name" r="DemoDefineOptions" />
    <Assert :l="vm.type.inheritAttrs" :r="false" />
  </div>
</template>
