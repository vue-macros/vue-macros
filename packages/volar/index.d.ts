import type { BaseOptions as _BaseOptions } from '@vue-macros/common'

type BaseOptions<T = {}> = (T & Omit<_BaseOptions, 'version'>) | boolean

export interface VolarOptions {
  defineModels?: BaseOptions<{
    unified?: boolean
  }>
  shortVmodel?: BaseOptions<{ prefix?: '::' | '$' | '*' }>
  templateRef?: BaseOptions<{
    alias?: string[]
  }>
  scriptLang?: BaseOptions<{
    defaultLang?: string
  }>
  defineProp?: BaseOptions<{
    edition: 'kevinEdition' | 'johnsonEdition'
  }>
  exportExpose?: BaseOptions
  exportProps?: BaseOptions
  exportRender?: BaseOptions
  defineOptions?: BaseOptions
  defineEmit?: BaseOptions
  defineProps?: BaseOptions
  definePropsRefs?: BaseOptions
  shortBind?: BaseOptions
  defineVmodel?: BaseOptions
  defineSlots?: BaseOptions
  jsxDirective?: BaseOptions
  setupJsdoc?: BaseOptions
  booleanProp?: BaseOptions
  DefineGeneric?: BaseOptions
  setupSFC?: BaseOptions
}
