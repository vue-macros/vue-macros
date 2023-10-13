import { useData } from 'vitepress'
import { t } from './utils'

export function useI18n(lang?: string) {
  function _t(key: string) {
    return t(key, lang || useData().lang.value)
  }

  return { t: _t }
}
