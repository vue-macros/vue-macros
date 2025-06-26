import { defineConfig } from 'tsdown/config'

export default defineConfig({
  unused: { ignore: ['vue-tsc'] },
  platform: 'node',
})
