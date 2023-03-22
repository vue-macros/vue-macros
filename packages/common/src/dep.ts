import { getPackageInfoSync } from 'local-pkg'

export function detectVueVersion(root: string = process.cwd()): 2 | 3 {
  const vuePkg = getPackageInfoSync('vue', { paths: [root] })
  if (vuePkg) {
    return +vuePkg.version.slice(0, 1) as 2 | 3
  } else {
    return 3
  }
}
