<script setup lang="ts">
import DefineRenderVue from './examples/define-render/index.vue'
import DefineOptionsVue from './examples/define-options/index.vue'
import DefinePropsVue from './examples/define-props/index.vue'
import HoistStaticVue from './examples/hoist-static/index.vue'
import DefineModelReactivityVue from './examples/define-models/reactivity-transform/parent.vue'
import DefineModelRuntimeVue from './examples/define-models/runtime/parent.vue'
import DefineSlotsVue from './examples/define-slots/parent.vue'
import BetterDefineVue from './examples/better-define/index.vue'
import ShortVmodel from './examples/short-vmodel/parent.vue'
import SetupSFC from './examples/setup-sfc/index.setup'
</script>

<template>
  <div grid="~ cols-3 gap2">
    <fieldset>
      <legend>defineOptions</legend>
      <DefineOptionsVue />
    </fieldset>

    <fieldset>
      <legend>defineRender</legend>
      <DefineRenderVue />
    </fieldset>

    <fieldset>
      <legend>defineProps</legend>
      <DefinePropsVue />
    </fieldset>

    <fieldset>
      <legend>hostStatic</legend>
      <HoistStaticVue />
    </fieldset>

    <fieldset>
      <legend>defineModels</legend>
      <DefineModelReactivityVue />
      <hr />
      <DefineModelRuntimeVue />
    </fieldset>

    <fieldset>
      <legend>defineSlots</legend>
      <DefineSlotsVue />
    </fieldset>

    <fieldset>
      <legend>betterDefine</legend>
      <BetterDefineVue />
    </fieldset>

    <fieldset>
      <legend>Short v-model</legend>
      <short-vmodel />
    </fieldset>

    <fieldset>
      <legend>setupSFC</legend>
      <SetupSFC />
    </fieldset>
  </div>
</template>

<style>
legend {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
}
</style>
