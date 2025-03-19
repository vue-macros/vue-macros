<script setup lang="tsx">
defineProps<{
  bar: string
}>()

defineModel<number>()
const value = defineModel<string, 'stringify' | 'number'>('value')

const slots = defineSlots()

defineRender(() => (
  <>
    <input v-model_trim={value.value} />
    <slots.default></slots.default>
  </>
))
</script>
