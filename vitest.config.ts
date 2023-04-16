import { defineConfig } from 'vitest/config'

export default defineConfig(() => {
  return {
    resolve: {
      conditions: ['dev'],
    },
    test: {
      singleThread: true,
    },
  }
})
