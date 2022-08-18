import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import glob from 'fast-glob'
import esbuild from 'rollup-plugin-esbuild'
import Vue from 'unplugin-vue/vite'
import VueJsx from '@vitejs/plugin-vue-jsx'
import { RemoveVueFilePathPlugin, rollupBuild } from '@vue-macros/test-utils'
import VueMacros from '../src/rollup'

describe('setup-component', async () => {
  const root = resolve(__dirname, '..')
  const files = await glob('tests/fixtures/setup-component/*.{vue,[jt]s?(x)}', {
    cwd: root,
    onlyFiles: true,
  })

  for (const file of files) {
    it(file.replace(/\\/g, '/'), async () => {
      const filepath = resolve(root, file)
      const version = filepath.includes('vue2') ? 2 : 3

      const code = await rollupBuild(filepath, [
        VueMacros({ version }),
        Vue() as any,
        VueJsx(),
        RemoveVueFilePathPlugin(),
        esbuild({
          target: 'esnext',
        }),
      ])
      expect(code).toMatchSnapshot()
    })
  }
})
