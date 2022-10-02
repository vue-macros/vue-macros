import { SETUP_COMPONENT_SUB_MODULE } from './constants'

export const isSubModule = (id: string) => SETUP_COMPONENT_SUB_MODULE.test(id)

export const getMainModule = (subModule: string, root: string) =>
  root + subModule.replace(SETUP_COMPONENT_SUB_MODULE, '')
