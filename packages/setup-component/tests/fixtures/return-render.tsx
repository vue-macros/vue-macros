export const App = defineSetupComponent(() => {
  defineProps<{
    foo: string
  }>()

  return () => <div />
})
