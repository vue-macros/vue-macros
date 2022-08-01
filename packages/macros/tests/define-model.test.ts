import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { describe, expect, test } from 'vitest'
import glob from 'fast-glob'
import { transformDefineModel } from '../src/define-model'

describe('define-model', async () => {
  const root = resolve(__dirname, '..')
  const files = await glob('tests/fixtures/define-model/*.{vue,js,ts}', {
    cwd: root,
    onlyFiles: true,
  })

  for (const file of files) {
    test(file.replace(/\\/g, '/'), async () => {
      const filepath = resolve(root, file)
      const version = filepath.includes('vue2') ? 2 : 3
      let result: any
      try {
        result = transformDefineModel(
          await readFile(filepath, 'utf-8'),
          filepath,
          version
        )?.toString()
      } catch (err) {
        result = err
      }
      expect(result).toMatchSnapshot()
    })
  }
})
