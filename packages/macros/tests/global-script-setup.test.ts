/// <reference types="vite/client" />
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import glob from 'fast-glob'
import esbuild from 'rollup-plugin-esbuild'
import Vue from 'unplugin-vue/vite'
import VueJsx from '@vitejs/plugin-vue-jsx'
import VueMacros from '../src/rollup'
import { getCode } from './_utils'

describe('global-script-setup', async () => {
  const root = resolve(__dirname, '..')
  const files = await glob(
    'tests/fixtures/global-script-setup/*.{vue,[jt]s?(x)}',
    {
      cwd: root,
      onlyFiles: true,
    }
  )

  for (const file of files) {
    it(file.replace(/\\/g, '/'), async () => {
      const filepath = resolve(root, file)
      const version = filepath.includes('vue2') ? 2 : 3

      const unpluginCode = await getCode(filepath, [
        VueMacros({
          version,
          globalScriptSetup: true,
        }),
        Vue(),
        VueJsx(),
        esbuild(),
      ])
      expect(
        unpluginCode.replace(/global-setup-component:.*?\.vue/, '#ID#')
      ).toMatchSnapshot()
    })
  }
})
