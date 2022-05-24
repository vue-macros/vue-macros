import { basename, dirname, resolve } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import fg from 'fast-glob'

// fix cjs exports
const files = await fg('*.js', {
  ignore: ['index.js', 'chunk-*'],
  absolute: true,
  cwd: resolve(dirname(fileURLToPath(import.meta.url)), '../dist'),
})
for (const file of files) {
  // eslint-disable-next-line no-console
  console.log('[postbuild]', basename(file))
  let code = await readFile(file, 'utf8')
  code = code.replace('exports.default =', 'module.exports =')
  code += 'exports.default = module.exports;'
  await writeFile(file, code)
}
