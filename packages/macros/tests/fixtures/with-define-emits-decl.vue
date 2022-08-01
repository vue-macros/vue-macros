<script setup lang="ts">
let { modelValue } = defineModel<{
  modelValue: string
}>()

const emit = defineEmits<{
  (evt: 'change'): void
}>()

{
  modelValue = 'hello'
  emit('change')

  {
    let modelValue = 'world'
    modelValue = 'foo'
  }
}
</script>
