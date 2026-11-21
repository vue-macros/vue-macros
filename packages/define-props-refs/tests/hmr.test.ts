import { expect, test } from 'vitest'
import VueDefinePropsRefs from '../src/vite'
import type { HmrContext, Plugin } from 'vite'

type Context = Pick<HmrContext, 'file' | 'read'>

test('transforms the code read by Vite HMR', async () => {
  const code = `<script setup lang="ts">
const { foo } = withDefaults(definePropsRefs<{ foo?: string }>(), {
  foo: 'foo',
})
</script>
`
  const ctx: Context = { file: '/src/App.vue', read: () => code }
  const plugin: Plugin = VueDefinePropsRefs()
  const hook = plugin.handleHotUpdate as ((ctx: Context) => void) | undefined
  await hook?.(ctx)

  // `@vitejs/plugin-vue` compiles the script read here, which fails on
  // `withDefaults(definePropsRefs())` if it is not transformed first
  const hmrCode = await ctx.read()
  expect(hmrCode).not.toContain('definePropsRefs')
  expect(hmrCode).toContain('withDefaults(defineProps<')
})
