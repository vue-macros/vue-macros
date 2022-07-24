/* eslint-disable unicorn/prefer-string-replace-all */

import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { describe, expect, it } from 'vitest'
import glob from 'fast-glob'
import { transform } from '../src'

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

        try {
          const code = transform(
            await readFile(filepath, 'utf-8'),
            filepath
          )?.code
          expect(code).toMatchSnapshot()
        } catch (err) {
          expect(err).toMatchSnapshot()
        }
      })
    }
  })
})
