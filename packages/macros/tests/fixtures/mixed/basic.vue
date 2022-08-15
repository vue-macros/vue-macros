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
let { modelValue } = defineModel<{
  modelValue: string
}>()

const handleClick = () => {
  emit('change')
  modelValue = 'hello, ' + title
}
</script>
