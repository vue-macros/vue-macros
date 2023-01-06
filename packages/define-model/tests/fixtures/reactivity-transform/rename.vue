<script setup lang="ts">
let { modelValue: visible, foo } = $defineModel<{
  modelValue: boolean
  foo: string
}>()

visible = false
console.log(visible, foo)
</script>
