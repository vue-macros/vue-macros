import { VIRTUAL_ID_PREFIX } from '@vue-macros/common'

export const helperId =
  `${VIRTUAL_ID_PREFIX}/reactivity-transform/helper` as const
export { default as helperCode } from './code?raw'
