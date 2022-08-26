import type { Macro } from './types'

export * from './transform'
export * from './utils'

export const defineMacro = (macro: Macro) => macro
