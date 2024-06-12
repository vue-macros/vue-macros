<script setup lang="tsx" generic="T">
const { bar } = defineProps<{
  bar: T
}>()

const slots = defineSlots<{
  default: () => any
  bottom: (props: { foo: 1 }) => any
}>()

const emit = defineEmits<{
  log: [foo: T]
  click: []
}>()

defineRender(() => (
  <form
    onSubmit_prevent
    onClick={() => emit('log', bar)}
    onKeydown_down={() => {}}
    onKeyup_up
  >
    <slots.default />
  </form>
))
</script>
