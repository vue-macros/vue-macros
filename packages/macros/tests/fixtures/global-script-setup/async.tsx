/// <reference path="../../../macros-global.d.ts" />

export const App = defineSetupComponent(async () => {
  defineProps<{
    foo: string
  }>()

  await foo()
})
