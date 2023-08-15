<script setup lang="tsx">
defineSlots<{
  default: (props: { foo: string }) => any
  bottom: (props: { foo: string }) => any
}>()
</script>

<template>
  <div>
    <slot v-bind="{ foo: 'default' }" />
    <div>
      <slot name="bottom" v-bind="{ foo: 'bottom' }" />
    </div>
  </div>
</template>
