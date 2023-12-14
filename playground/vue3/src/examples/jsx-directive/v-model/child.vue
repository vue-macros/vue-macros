<script setup lang="tsx">
const slots = defineSlots<{
  default: (scope: { value: string }) => any
  title: (scope: { value: string; 'onUpdate:value': (e: any) => void }) => any
}>()

defineProps<{
  bar: string
}>()

defineModels<{
  modelValue: number
  title: number
  bottom: number
}>()

const value = $ref('')
defineRender(() => (
  <>
    <slots.title v-model:value_trim={value}></slots.title>

    <slots.default value={value}></slots.default>
  </>
))
</script>
