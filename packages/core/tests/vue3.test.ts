/* eslint-disable unicorn/prefer-string-replace-all */

import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { describe, expect, it } from 'vitest'
import glob from 'fast-glob'
import { transform } from '../src'
// import { ToString, getCode } from './_utils'

describe('vue 3', () => {
  describe('fixtures', async () => {
    const root = resolve(__dirname, '..')
    const files = await glob('tests/fixtures/*.{vue,js,ts}', {
      cwd: root,
      onlyFiles: true,
    })

    for (const file of files) {
      it(file.replace(/\\/g, '/'), async () => {
        const filepath = resolve(root, file)

        const { code } = transform(await readFile(filepath, 'utf-8'), filepath)
        expect(code).toMatchSnapshot()

        // const unpluginCode = await getCode(filepath, [
        //   // VueDefineOptions({}),
        //   ToString,
        // ]).catch((err) => err)
        // expect(unpluginCode).toMatchSnapshot()
      })
    }
  })
})
