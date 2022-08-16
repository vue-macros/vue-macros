export const App = defineSetupComponent(() => {
  defineProps<{
    foo: string
  }>()

  defineEmits<{
    (evt: 'change'): void
  }>()

  defineOptions({
    name: 'App',
  })
})
