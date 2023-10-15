<script setup lang="ts">
import { Fail, Ok } from '../../assert'

export type TitleScope = { foo: boolean | 'foo' }
export type DefaultScope = { bar: 'bar' | number }

interface Slots {
  // short syntax
  title: (scope: TitleScope) => any
  // full syntax
  default: DefaultScope
}
defineSlots<Slots>()
</script>

<template>
  <div>
    <slot name="title" foo="foo"><Ok /></slot>
    <slot name="default" bar="bar"><Fail /></slot>

    <!-- For type check -->
    <!-- eslint-disable-next-line vue/no-constant-condition -->
    <template v-if="false">
      <slot name="title" :foo="false" />
      <slot name="default" :bar="1" />

      <!-- @vue-expect-error wrong type -->
      <slot name="title" :foo="123" />

      <!-- @vue-expect-error missing scope -->
      <slot name="default" />
      <!-- @vue-expect-error wrong type -->
      <slot name="default" bar="baz" />
    </template>
  </div>
</template>
