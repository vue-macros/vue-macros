/* eslint-disable node/prefer-global/process */

let require: NodeJS.Require | undefined

function getRequire() {
  if (require) return require

  try {
    // @ts-expect-error check api
    if (globalThis.process?.getBuiltinModule) {
      const module = process.getBuiltinModule('module')
      // unenv has implemented `getBuiltinModule` but has yet to support `module.createRequire`
      if (module?.createRequire) {
        return (require = module.createRequire(import.meta.url))
      }
    }
  } catch {}
}

export function detectVueVersion(root?: string, defaultVersion = 3.5): number {
  const require = getRequire()
  // cannot detect version
  if (!require) {
    console.warn(`Cannot detect Vue version. Default to Vue ${defaultVersion}`)
    return defaultVersion
  }

  const { resolve } = require('node:path') as typeof import('path')
  const { statSync } = require('node:fs') as typeof import('fs')
  const { getPackageInfoSync } =
    require('local-pkg') as typeof import('local-pkg')

  root ||= process.cwd()

  let isFile = false
  try {
    isFile = statSync(root).isFile()
  } catch {}
  const paths: string[] = [root]
  if (!isFile) paths.unshift(resolve(root, '_index.js'))
  const vuePkg = getPackageInfoSync('vue', { paths })
  if (vuePkg && vuePkg.version) {
    const version = Number.parseFloat(vuePkg.version)
    return version >= 2 && version < 3 ? Math.trunc(version) : version
  } else {
    return defaultVersion
  }
}
