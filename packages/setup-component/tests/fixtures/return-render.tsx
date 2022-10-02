import { computed } from 'vue'

export const App = defineSetupComponent(() => {
  defineProps<{
    foo: string
  }>()

  const sum = computed(() => 1 + 2)

  return () => (
    <div>{sum.value}</div>
  )
})
