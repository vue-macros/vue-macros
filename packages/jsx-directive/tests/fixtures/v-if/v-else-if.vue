<script setup lang="tsx">
const { foo = 0 } = defineProps<{
  foo: number
}>()

defineRender(() => (
  <>
    <div v-if={foo === 0}>0</div>
    <div v-else-if={foo === 1}>1</div>
    <div v-else-if={foo === 2}>2</div>
  </>
))
</script>
