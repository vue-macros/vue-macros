<script setup lang="ts" generic="T">
const { foo } = defineProps<{
  foo: T
}>()

defineExpose({
  foo,
})
</script>
