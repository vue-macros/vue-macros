<script setup lang="ts">
import { defineComponent, getCurrentInstance } from 'vue'
import { Assert } from '../../assert'
import Empty from './empty.vue'
import Tsx from './tsx.vue'

defineOptions({
  name: 'ExampleDefineOptions',
  inheritAttrs: false,
  methods: {
    foo: () => {},
  },
})

const Comp = defineComponent({
  setup() {},
})
let comp!: InstanceType<typeof Comp>
// @ts-expect-error
console.log(comp?.foo)

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
