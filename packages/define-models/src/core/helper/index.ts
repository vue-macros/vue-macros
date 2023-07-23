import { VIRTUAL_ID_PREFIX } from '@vue-macros/common'

export const helperPrefix = `${VIRTUAL_ID_PREFIX}/define-models` as const

export const emitHelperId = `${helperPrefix}/emit-helper` as const
export { default as emitHelperCode } from './emit-helper?raw'

export const useVmodelHelperId = `${helperPrefix}/use-vmodel` as const
export { default as useVmodelHelperCode } from './use-vmodel?raw'
