<script setup lang="tsx">
const slots = defineSlots<{
  default: () => any
  bottom: (props: { foo: 1 }) => any
}>()

const emit = defineEmits<{
  log: [foo: number]
}>()

defineRender(() => (
  <span onClick={() => emit('log', 1)}>
    <slots.default />
    <slots.bottom {...{ foo: 1 }} />
  </span>
))
</script>
