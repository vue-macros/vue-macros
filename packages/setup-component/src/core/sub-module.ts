import { SETUP_COMPONENT_SUB_MODULE } from './constants'

export function isSubModule(id: string): boolean {
  return SETUP_COMPONENT_SUB_MODULE.test(id)
}

export function getMainModule(subModule: string, root: string): string {
  return root + subModule.replace(SETUP_COMPONENT_SUB_MODULE, '')
}
