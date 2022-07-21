<script setup lang="ts">
const { modelValue } = defineModel<{
  modelValue: string
  visible: boolean
}>()

defineProps<{
  title?: string
}>()
</script>
