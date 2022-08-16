export const App = defineSetupComponent(async () => {
  defineProps<{
    foo: string
  }>()

  await (globalThis as any).foo()
})
