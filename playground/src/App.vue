<script setup lang="ts">
import { ref } from 'vue'

import DefineRenderVue from './demo/define-render.vue'
import DefineOptionsVue from './demo/define-options.vue'
import DefineOptionsEmptyVue from './demo/define-options-empty.vue'
import DefineOptionsTsx from './demo/define-options-tsx.vue'
import HoistStaticVue from './demo/hoist-static.vue'
import DefineModelVue from './demo/define-model.vue'

const title = ref('hello')
</script>

<template>
  <DefineRenderVue />
  <hr />
  <DefineOptionsVue />
  <hr />
  <DefineOptionsEmptyVue />
  <hr />
  <DefineOptionsTsx />
  <hr />
  <HoistStaticVue />
  <hr />
  <DefineModelVue v-model:title="title" />
</template>
