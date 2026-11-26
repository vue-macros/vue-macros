import { VIRTUAL_ID_PREFIX } from '@vue-macros/common'

export const helperPrefix: '/vue-macros/define-models' = `${VIRTUAL_ID_PREFIX}/define-models`
export const HELPER_PREFIX_REGEX: RegExp = new RegExp(
  `^${VIRTUAL_ID_PREFIX}[/\\\\]define-models`,
)
export const emitHelperId: '/vue-macros/define-models/emit-helper' = `${helperPrefix}/emit-helper`
export const EMITTER_ID_REGEX: RegExp = new RegExp(
  `${VIRTUAL_ID_PREFIX}[/\\\\]define-models[/\\\\]emit-helper`,
)
export { default as emitHelperCode } from './emit-helper?raw'

export const useVmodelHelperId: '/vue-macros/define-models/use-vmodel' = `${helperPrefix}/use-vmodel`
export const USE_VMODEL_ID_REGEX: RegExp = new RegExp(
  `${VIRTUAL_ID_PREFIX}[/\\\\]define-models[/\\\\]use-vmodel`,
)
export { default as useVmodelHelperCode } from './use-vmodel?raw'
