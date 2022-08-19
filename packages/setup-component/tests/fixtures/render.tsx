export const App = defineSetupComponent(() => {
  defineProps<{
    foo: string
  }>()

  defineRender(() => <div />)
})
