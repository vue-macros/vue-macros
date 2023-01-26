import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/*.ts', '!./src/*.d.ts', '!./src/common.ts'],
  format: ['cjs'],
  target: 'node14',
  splitting: false,
  dts: false,
  clean: true,
})
