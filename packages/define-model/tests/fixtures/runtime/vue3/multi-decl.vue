<script setup lang="ts">
const a = 'b',
  { modelValue } = defineModel<{
    modelValue: string
    visible: boolean
  }>()
</script>
