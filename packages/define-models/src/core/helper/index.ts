import { VIRTUAL_ID_PREFIX } from '@vue-macros/common'

export const helperPrefix: '/vue-macros/define-models' = `${VIRTUAL_ID_PREFIX}/define-models`

export const emitHelperId: '/vue-macros/define-models/emit-helper' = `${helperPrefix}/emit-helper`
export { default as emitHelperCode } from './emit-helper?raw'

export const useVmodelHelperId: '/vue-macros/define-models/use-vmodel' = `${helperPrefix}/use-vmodel`
export { default as useVmodelHelperCode } from './use-vmodel?raw'
