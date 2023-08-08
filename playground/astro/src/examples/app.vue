<script setup lang="tsx">
import DefineOptionsVue from './define-options/index.vue'
import DefineModelRuntime from './define-models/runtime/parent.vue'
import DefineModelReactivity from './define-models/reactivity-transform/parent.vue'
import DefineRender from './define-render/index.vue'
import DefineProps from './define-props/index.vue'
import HoistStatic from './hoist-static/index.vue'
import DefineSlots from './define-slots/parent.vue'
import BetterDefine from './better-define/index.vue'
import ShortVModel from './short-vmodel/parent.vue'
import SetupSFC from './setup-sfc/index.setup'
</script>

<template>
  <fieldset>
    <legend>defineOptions</legend>
    <DefineOptionsVue />
  </fieldset>

  <fieldset>
    <legend>defineRender</legend>
    <DefineRender />
  </fieldset>

  <fieldset>
    <legend>defineProps</legend>
    <DefineProps />
  </fieldset>

  <fieldset>
    <legend>hostStatic</legend>
    <HoistStatic />
  </fieldset>

  <fieldset>
    <legend>defineModels</legend>
    <DefineModelRuntime />
    <hr />
    <DefineModelReactivity />
  </fieldset>

  <fieldset>
    <legend>defineSlots</legend>
    <DefineSlots />
  </fieldset>

  <fieldset>
    <legend>betterDefine</legend>
    <BetterDefine />
  </fieldset>

  <fieldset>
    <legend>Short v-model</legend>
    <ShortVModel />
  </fieldset>

  <fieldset>
    <legend>setupSFC</legend>
    <SetupSFC />
  </fieldset>
</template>
