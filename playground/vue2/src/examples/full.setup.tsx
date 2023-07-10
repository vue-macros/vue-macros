import { type DefineComponent } from 'vue'
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
  value: string
}>()

export default (
  <div>
    Magic Vue!
    <pre>
      {name}
      {foo}
    </pre>
  </div>
) as any as DefineComponent
