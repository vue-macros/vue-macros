/* eslint perfectionist/sort-interfaces: "error" */
import type { FilterOptions } from '@vue-macros/common'

type BaseOptions<T = {}> = (T & Omit<FilterOptions, 'version'>) | boolean

export interface VolarOptions {
  booleanProp?: BaseOptions
  defineEmit?: BaseOptions
  defineGeneric?: BaseOptions
  defineModels?: BaseOptions<{
    unified?: boolean
  }>
  defineOptions?: BaseOptions
  defineProp?: BaseOptions<{
    edition: 'kevinEdition' | 'johnsonEdition'
  }>
  defineProps?: BaseOptions
  definePropsRefs?: BaseOptions
  defineSlots?: BaseOptions
  defineVmodel?: BaseOptions
  exportExpose?: BaseOptions
  exportProps?: BaseOptions
  exportRender?: BaseOptions
  jsxDirective?: BaseOptions
  scriptLang?: BaseOptions<{
    defaultLang?: string
  }>
  setupJsdoc?: BaseOptions
  setupSFC?: BaseOptions
  shortBind?: BaseOptions
  shortVmodel?: BaseOptions<{
    prefix?: '::' | '$' | '*'
  }>
  templateRef?: BaseOptions<{
    alias?: string[]
  }>
}
