<script setup lang="tsx">
import { expectTypeOf } from 'expect-type'
const { foo } = defineProps<{
  foo: number
}>()

defineRender(() => (
  <>
    <div v-if={foo === 0}>{expectTypeOf<0>(foo)}</div>
    <div v-if={foo ? true : false}>1</div>
  </>
))
</script>
