import path from 'node:path'
import { REGEX_LANG_TS } from './constants'

export function getLang(filename: string) {
  return path.extname(filename).replace(/^\./, '')
}

export function isTs(lang?: string) {
  return lang && REGEX_LANG_TS.test(lang)
}
