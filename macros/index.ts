import path from 'node:path'

import { defineMacro } from 'unplugin-macros/api'

export * from './repo'

const root = path.resolve(__dirname, '..')

function getPkgName(filePath: string) {
  const relative = path.relative(root, filePath)
  const [, pkgName] = relative.split(path.sep)
  return pkgName
}

export const generatePluginName = defineMacro(function () {
  const pkgName = getPkgName(this.id)
  return `unplugin-vue-${pkgName}`
})
