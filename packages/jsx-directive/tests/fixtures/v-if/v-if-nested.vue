<script setup lang="tsx">
const { foo = 0 } = defineProps<{
  foo: number
}>()

defineRender(() => (
  <>
    <div v-if={foo === 0}>
      <div v-if={foo === 0}>0-0</div>
      <div v-else-if={foo === 1}>0-1</div>
      <div v-else>0-2</div>
    </div>
  </>
))
</script>
