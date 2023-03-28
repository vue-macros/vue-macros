import { getPackageInfoSync } from 'local-pkg'

export function detectVueVersion(root: string = process.cwd()): number {
  const vuePkg = getPackageInfoSync('vue', { paths: [root] })
  if (vuePkg && vuePkg.version) {
    const versions = vuePkg.version.split('.')
    const version = +versions.slice(0, 2).join('.')
    return version >= 2 && version < 3 ? Math.trunc(version) : version
  } else {
    return 3
  }
}
