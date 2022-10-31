import path from 'node:path'
import { REGEX_TS_FILE } from './constants'

export function getLang(filename: string) {
  return path.extname(filename).replace(/^\./, '')
}

export function isTs(lang?: string) {
  return lang && REGEX_TS_FILE.test(lang)
}
