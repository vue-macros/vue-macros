<script setup lang="ts">
let { modelValue } = $defineModels<{
  modelValue: string
  visible: boolean
}>()

const { title } = defineProps<{
  title?: string
}>()
</script>
