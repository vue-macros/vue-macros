<script setup lang="ts">
const { modelValue } = defineModel<{
  modelValue: string
  visible: boolean
}>()

const { title, ...props } = defineProps<{
  title?: string
}>()

console.log(props)
</script>
