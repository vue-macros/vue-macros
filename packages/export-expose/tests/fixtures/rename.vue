<script setup lang="ts">
const foo = 1,
  bar = 1

// @ts-expect-error
export { foo } from './types'
// @ts-expect-error
export * as bar from './types'
</script>
