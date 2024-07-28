import { type DefineComponent } from 'vue'

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
  value: string
}>()

export default (
  <div>
    Magic Vue!
    <pre>{name}</pre>
  </div>
)
