export const App = defineSetupComponent(() => {
  defineProps<{
    foo: string
  }>()

  defineOptions({
    name: 'RenderApp',
    render() {
      // @ts-ignore
      return <div />
    },
  })
})
