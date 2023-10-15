import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineMacro } from 'unplugin-macros'

export * from './repo'

const root = path.resolve(fileURLToPath(new URL(import.meta.url)), '../..')

function getPkgName(filePath: string) {
  const relative = path.relative(root, filePath)
  const [, pkgName] = relative.split(path.sep)
  return pkgName
}

export const generatePluginName = defineMacro(function () {
  const pkgName = getPkgName(this.id)
  return `unplugin-vue-${pkgName}`
})
