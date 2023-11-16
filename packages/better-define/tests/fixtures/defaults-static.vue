<script setup lang="ts">
withDefaults(
  defineProps<{
    foo?: string
    bar?: number
    baz?: Promise<number>
    qux?: () => void
    quux?: any
  }>(),
  {
    foo: 'foo',
    get bar() {
      return 10
    },
    async baz() {
      return 10
    },
    ...{
      qux: () => {},
      ...{
        // @ts-expect-error
        quux: abc,
      },
    },
  }
)
</script>

<template>
  <div />
</template>
