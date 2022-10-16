<script setup lang="ts">
const { ...rest } = defineModel<{
  modelValue: string
  visible: boolean
}>()

rest.modelValue.value = 'foo'
</script>
