<script setup lang="ts">
defineOptions({
  name: 'Foo',
  model: {
    prop: 'value',
    event: 'changeInput'
  },
})
const { title } = defineProps<{
  title: string
}>()
const emit = defineEmits<{
  (evt: 'change'): void
}>()
let { modelValue, value } = defineModel<{
  modelValue: string
  value: string
}>()

const handleClick = () => {
  emit('change')
  modelValue.value = 'hello, ' + title
  value.value = 'Word,' + title
}
</script>
