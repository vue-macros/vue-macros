<script setup lang="ts">
const { modelValue } = defineModel<{
  modelValue: string
}>()

modelValue.value = 'hello'
</script>
