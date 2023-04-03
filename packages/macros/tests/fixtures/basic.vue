<script setup lang="ts">
const name = 'Foo'
defineOptions({
  name,
})
const { title } = defineProps<{
  title: string
}>()
const emit = defineEmits<{
  (evt: 'change'): void
}>()
let { modelValue } = defineModels<{
  modelValue: string
}>()

const handleClick = () => {
  emit('change')
  modelValue.value = 'hello, ' + title
}
</script>
