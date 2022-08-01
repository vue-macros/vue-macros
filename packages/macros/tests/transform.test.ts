/* eslint-disable unicorn/prefer-string-replace-all */

import { resolve } from 'path'
import { readFile } from 'fs/promises'
import { describe, expect, test } from 'vitest'
import glob from 'fast-glob'
import { transform } from '../src'

describe('transform', async () => {
  const root = resolve(__dirname, '..')
  const files = await glob('tests/fixtures/*.{vue,js,ts}', {
    cwd: root,
    onlyFiles: true,
  })

  for (const file of files) {
    test(file.replace(/\\/g, '/'), async () => {
      const filepath = resolve(root, file)
      const version = filepath.includes('vue2') ? 2 : 3
      try {
        const code = transform(
          await readFile(filepath, 'utf-8'),
          filepath,
          version
        )?.code
        expect(code).toMatchSnapshot()
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
    })
  }
})
