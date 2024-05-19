<script setup lang="ts">
import { expectTypeOf } from 'expect-type'
import { Assert } from '../../assert'
import Child, { type DefaultScope, type TitleScope } from './child.vue'

declare const expectTitleScope: TitleScope
declare const expectDefaultScope: DefaultScope
</script>

<template>
  <child>
    <template #title="scope">
      {{ expectTypeOf(scope).toEqualTypeOf(expectTitleScope) }}
    </template>

    <template #default="scope">
      <Assert :l="scope.bar" r="bar" />
      {{ expectTypeOf(scope).toEqualTypeOf(expectDefaultScope) }}
    </template>

    <template #any="{ any }">
      {{ any }}
    </template>
  </child>
</template>
