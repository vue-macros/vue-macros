import path from 'node:path'
import { statSync } from 'node:fs'
import { getPackageInfoSync } from 'local-pkg'

export function detectVueVersion(root: string = process.cwd()): number {
  let isFile = false
  try {
    isFile = statSync(root).isFile()
  } catch {}
  const paths: string[] = [root]
  if (!isFile) paths.unshift(path.resolve(root, '_index.js'))
  const vuePkg = getPackageInfoSync('vue', { paths })
  if (vuePkg && vuePkg.version) {
    const version = Number.parseFloat(vuePkg.version)
    return version >= 2 && version < 3 ? Math.trunc(version) : version
  } else {
    return 3
  }
}
