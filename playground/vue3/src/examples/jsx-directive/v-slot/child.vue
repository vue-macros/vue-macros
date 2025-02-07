<script setup lang="tsx">
const slots = defineSlots<{
  default: (props: { foo: string }) => any
  bottom: (props: { foo: 1 }) => any
}>()

defineRender(() => (
  <span>
    <slots.default v-if={slots.default} foo="begin" />
    <slots.bottom v-if={slots.bottom} {...{ foo: 1 }} />
  </span>
))
</script>
