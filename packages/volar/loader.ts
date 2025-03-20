import { createJiti } from 'jiti'

const jiti = createJiti(__filename)
const mod: any = jiti('__FILE__')

// @ts-expect-error
export = mod.default as any
