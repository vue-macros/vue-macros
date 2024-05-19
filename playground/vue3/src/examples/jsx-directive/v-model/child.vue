<script setup lang="tsx">
defineProps<{
  bar: string
}>()

const { title } = defineModels<{
  modelValue: number
  title?: string
}>()

const slots = defineSlots()

defineRender(() => (
  <>
    <input v-model={title.value} />
    <slots.default></slots.default>
  </>
))
</script>
