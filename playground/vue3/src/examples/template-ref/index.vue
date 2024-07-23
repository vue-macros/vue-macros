<script setup lang="ts">
import { templateRef } from '@vueuse/core'
import { expectTypeOf } from 'expect-type'
import { defineComponent, ref } from 'vue'
import Comp2 from './comp.vue'

const foo = ref(1)

const Comp1 = defineComponent({
  setup() {
    return { foo: 1 }
  },
})

const comp = templateRef('comp')
const comp1 = templateRef('comp1')
const comp2 = templateRef('comp2')
</script>

<template>
  <template v-if="comp">
    <Comp ref="comp" :foo="foo" />
    {{ expectTypeOf<[number]>([comp.foo]) }}
  </template>

  <Comp1 ref="comp1" :foo="foo" />
  {{ expectTypeOf<[number | null | undefined]>([comp1?.foo]) }}

  <!-- prettier-ignore -->
  <Comp2 ref="comp2" :foo="(2 as const)" />
  {{ expectTypeOf<[2 | null | undefined]>([comp2?.foo]) }}
</template>
