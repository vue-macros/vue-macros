import { VIRTUAL_ID_PREFIX } from '@vue-macros/common'

export const helperPrefix: '/vue-macros/jsx-directive' = `${VIRTUAL_ID_PREFIX}/jsx-directive`

export const withDefaultsHelperId: '/vue-macros/jsx-directive/with-defaults' = `${helperPrefix}/with-defaults`
export { default as withDefaultsHelperCode } from './with-defaults?raw'
