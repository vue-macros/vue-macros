import path from 'node:path'
import { REGEX_DTS, REGEX_LANG_TS } from './constants'

export function getLang(filename: string) {
  if (isDts(filename)) return 'dts'
  return path.extname(filename).replace(/^\./, '')
}

export function isDts(filename: string) {
  return REGEX_DTS.test(filename)
}

export function isTs(lang?: string) {
  return lang && (lang === 'dts' || REGEX_LANG_TS.test(lang))
}
