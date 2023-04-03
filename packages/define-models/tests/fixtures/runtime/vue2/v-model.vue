<script setup lang="ts">
const { modelValue } = defineModels<{
  modelValue: string
}>()

modelValue.value = 'hello'
</script>
