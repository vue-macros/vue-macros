/* eslint-disable no-console */
import { basename, resolve } from 'path'
import { promises as fs } from 'fs'
import fg from 'fast-glob'

async function run() {
  // fix cjs exports
  const files = await fg('*.js', {
    ignore: ['index.js', 'chunk-*'],
    absolute: true,
    cwd: resolve(__dirname, '../dist'),
  })
  for (const file of files) {
    console.log('[postbuild]', basename(file))
    const name = basename(file, '.js')
    let code = await fs.readFile(file, 'utf8')
    code = code.replace('exports.default =', 'module.exports =')
    code += 'exports.default = module.exports;'
    await fs.writeFile(file, code)
    await fs.writeFile(
      `${name}.d.ts`,
      `export { default } from './dist/${name}'\n`
    )
  }
}

run()
