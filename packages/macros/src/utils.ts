import { getPackageInfoSync } from 'local-pkg'

export const getVueVersion = (): 2 | 3 => {
  const vuePkg = getPackageInfoSync('vue')
  if (vuePkg) {
    return +vuePkg.version.slice(0, 1) as 2 | 3
  } else {
    return 3
  }
}
