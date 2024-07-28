type T = DefineGeneric

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

export default (
  <form onSubmit_prevent onClick={() => emit('log', bar)}>
    <slots.default />
  </form>
)
