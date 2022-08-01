<script setup lang="ts">
defineOptions({
  name: 'Foo',
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
