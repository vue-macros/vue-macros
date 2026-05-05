import { VIRTUAL_ID_PREFIX } from '@vue-macros/common'

export const helperId: '/vue-macros/define-prop/helper' = `${VIRTUAL_ID_PREFIX}/define-prop/helper`
export const HELPER_ID_REGEX: RegExp = new RegExp(
  `${VIRTUAL_ID_PREFIX}[/\\\\]define-prop[/\\\\]helper`,
)
export { default as helperCode } from './code?raw'
