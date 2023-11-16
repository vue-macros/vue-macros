<script setup lang="ts">
export interface IMenu {
  txt: string
  children?: IMenu[]
}

const props = withDefaults(
  defineProps<{
    menu?: IMenu | IMenu[]
  }>(),
  {
    menu: () => ({ txt: '1-1' }),
  },
)
</script>

<template>
  {{ props.menu }}
</template>
