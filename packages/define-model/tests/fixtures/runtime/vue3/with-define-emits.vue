<script setup lang="ts">
const { modelValue } = defineModel<{
  modelValue: string
}>()

const emit = defineEmits<{
  (evt: 'change'): void
}>()

emit('change')
modelValue.value = 'hello'
</script>
