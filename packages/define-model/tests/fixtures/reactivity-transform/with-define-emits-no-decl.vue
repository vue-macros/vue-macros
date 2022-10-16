<script setup lang="ts">
let { modelValue } = $defineModel<{
  modelValue: string
}>()

defineEmits<{
  (evt: 'change'): void
}>()

modelValue = '1'
</script>
