import { SETUP_COMPONENT_SUB_MODULE } from './constants'

export function isSubModule(id: string) {
  return SETUP_COMPONENT_SUB_MODULE.test(id)
}

export function getMainModule(subModule: string, root: string) {
  return root + subModule.replace(SETUP_COMPONENT_SUB_MODULE, '')
}
