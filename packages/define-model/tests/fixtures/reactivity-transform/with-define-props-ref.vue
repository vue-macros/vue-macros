<script setup lang="ts">
interface Props {
  title?: string
}

defineProps<Props>()

const { modelValue } = $defineModel<{
  modelValue: string
  visible: boolean
}>()
</script>
