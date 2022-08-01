<script setup lang="ts">
let { modelValue } = defineModel<{
  modelValue: string
  visible: boolean
}>()

const { title } = defineProps<{
  title?: string
}>()
</script>
