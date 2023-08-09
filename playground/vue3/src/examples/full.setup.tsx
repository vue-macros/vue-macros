import { foo } from './setup-component/foo'

const name = 'Greet'
defineOptions({
  name,
})

defineProps<{
  title?: string
}>()

defineEmits<
  SE<{
    change: [value: string]
    submit(name: string): void
  }>
>()

$defineModels<{
  modelValue: string
}>()

export default () => (
  <div>
    Magic Vue!
    <pre>
      {name}
      {foo}
    </pre>
  </div>
)
