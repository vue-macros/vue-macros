<script setup lang="ts">
let { modelValue } = $defineModels<{
  modelValue: string
}>()

defineEmits<{
  (evt: 'change'): void
}>()

modelValue = '1'
</script>
