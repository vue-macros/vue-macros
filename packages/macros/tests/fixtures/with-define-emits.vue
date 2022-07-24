<script setup lang="ts">
const { modelValue } = defineModel<{
  modelValue: string
}>()

defineEmits<{
  (evt: 'change'): void
}>()
</script>
