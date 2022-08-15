/// <reference types="vite/client" />
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import glob from 'fast-glob'
import esbuild from 'rollup-plugin-esbuild'
import Vue from 'unplugin-vue/vite'
import VueJsx from '@vitejs/plugin-vue-jsx'
import VueMacros from '../src/rollup'
import { defaultSetupSFCFilter } from '../src/setup-sfc'
import { getCode } from './_utils'

describe('setup-component', async () => {
  test('isSetupSFC', () => {
    expect(defaultSetupSFCFilter('foo.setup.ts')).toBe(true)
    expect(defaultSetupSFCFilter('foo.setup.tsx')).toBe(true)
    expect(defaultSetupSFCFilter('foo.setup.jsx')).toBe(true)
    expect(defaultSetupSFCFilter('foo.setup.js')).toBe(true)
    expect(defaultSetupSFCFilter('foo.setup.mjs')).toBe(true)
    expect(defaultSetupSFCFilter('foo.setup.cts')).toBe(true)
  })

  describe('fixtures', async () => {
    const root = resolve(__dirname, '..')
    const files = await glob('tests/fixtures/setup-sfc/*.{vue,[jt]s?(x)}', {
      cwd: root,
      onlyFiles: true,
    })

    for (const file of files) {
      test(file.replace(/\\/g, '/'), async () => {
        const filepath = resolve(root, file)
        const version = filepath.includes('vue2') ? 2 : 3

        const unpluginCode = await getCode(filepath, [
          VueMacros({ version }),
          Vue({
            include: [/\.setup\.[jt]sx?/],
          }),
          VueJsx(),
          esbuild(),
        ])
        expect(unpluginCode).toMatchSnapshot()
      })
    }
  })
})
