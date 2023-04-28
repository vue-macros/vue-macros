<script setup lang="ts">
import DefineOptionsVue from './examples/define-options/index.vue'
import DefineModelVue from './examples/define-models/parent.vue'
import DefineSlotsVue from './examples/define-slots/parent.vue'
import BetterDefineVue from './examples/better-define/index.vue'
import DefineRenderVue from './examples/define-render/index.vue'
import HoistStaticVue from './examples/hoist-static/index.vue'
import ReactivityTransformVue from './examples/reactivity-transform/index.vue'
import DefinePropVue from './examples/define-prop/parent.vue'

// import { SetupComponentFoo } from './examples/setup-component'
// import { SetupComponentType } from './examples/setup-component/types'

import SetupSFC from './examples/setup-sfc/index.setup'

// import Full from './examples/full.setup'
// import ShortVmodel from './examples/short-vmodel.vue'
</script>

<template>
  <div>
    <fieldset>
      <legend>defineOptions</legend>
      <DefineOptionsVue />
    </fieldset>

    <fieldset>
      <legend>defineModels</legend>
      <DefineModelVue />
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
      <legend>defineRender</legend>
      <DefineRenderVue />
    </fieldset>

    <fieldset>
      <legend>hostStatic</legend>
      <HoistStaticVue />
    </fieldset>

    <fieldset>
      <legend>setupSFC</legend>
      <SetupSFC />
    </fieldset>

    <fieldset>
      <legend>reactivityTransform</legend>
      <ReactivityTransformVue />
    </fieldset>

    <fieldset>
      <legend>defineProp</legend>
      <DefinePropVue />
    </fieldset>

    <!-- <fieldset>
      <legend>setupComponent</legend>
      <SetupComponentFoo />
      <hr />
      <SetupComponentType />
    </fieldset>


    <fieldset>
      <legend>Short v-model</legend>
      <short-vmodel />
    </fieldset>

    <fieldset>
      <legend>Full example</legend>
      <Full />
    </fieldset> -->
  </div>
</template>

<style>
legend {
  font-family: monospace;
  font-size: 16px;
  font-weight: bold;
}
</style>
