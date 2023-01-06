<script setup lang="ts">
const { modelValue: visible, foo } = defineModel<{
  modelValue: boolean
  foo: string
}>()

console.log(visible, foo)
</script>
