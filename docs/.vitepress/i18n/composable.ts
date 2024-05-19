import { useData } from 'vitepress'
import { t } from './utils'

export function useTranslate(lang?: string) {
  return (key: string) => t(key, lang || useData().lang.value)
}
