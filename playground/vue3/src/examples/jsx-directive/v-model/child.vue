<script setup lang="tsx">
const slots = defineSlots<{
  default: (scope: { value: string }) => any
  title: (scope: { value: string; 'onUpdate:value': (e: any) => void }) => any
}>()

const value = $ref('')
defineRender(() => (
  <>
    <slots.title v-model_trim={[value, 'value']}></slots.title>

    <slots.default value={value}></slots.default>
  </>
))
</script>
