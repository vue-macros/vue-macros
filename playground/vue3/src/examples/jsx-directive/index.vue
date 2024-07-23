<script setup lang="ts">
import JsxDirectiveVFor from './v-for.vue'
import JsxDirectiveVHtml from './v-html.vue'
import JsxDirectiveVIf from './v-if.vue'
import JsxDirectiveVMemo from './v-memo.vue'
import JsxDirectiveVModel from './v-model/index.vue'
import JsxDirectiveVOn from './v-on/index.vue'
import JsxDirectiveVSlot from './v-slot/index.vue'
</script>

<template>
  <div>
    <JsxDirectiveVIf />
    <JsxDirectiveVFor />
    <JsxDirectiveVMemo />
    <JsxDirectiveVHtml />
    <JsxDirectiveVSlot />
    <JsxDirectiveVOn />
    <JsxDirectiveVModel />
  </div>
</template>
