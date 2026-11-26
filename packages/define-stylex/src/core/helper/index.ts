import { VIRTUAL_ID_PREFIX } from '@vue-macros/common'

export const helperPrefix: '/vue-macros/define-stylex' = `${VIRTUAL_ID_PREFIX}/define-stylex`
export const HELPER_PREFIX_REGEX: RegExp = new RegExp(
  `${VIRTUAL_ID_PREFIX}[/\\\\]define-stylex`,
)
export const styleXAttrsId: string = `${helperPrefix}/stylex-attrs`
export const STYLEX_ATTRS_ID_REGEX: RegExp = new RegExp(
  `${VIRTUAL_ID_PREFIX}[/\\\\]define-stylex`,
)
export { default as styleXAttrsCode } from './stylex-attrs?raw'
