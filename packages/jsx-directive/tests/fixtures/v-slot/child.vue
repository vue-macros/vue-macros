<script setup lang="tsx" generic="T">
defineProps<{
  baz?: T
}>()

const slots = defineSlots<{
  default: () => any
  title: (props: { foo: T }) => any
  bottom: (props: { foo: 1 }) => any
  center: (props: { foo: 1 }) => any
  'bot-tom': (props: { foo: 1 }) => any
}>()

defineRender(() => (
  <span>
    <slots.default />
    <slots.bottom foo={1} />
  </span>
))
</script>
