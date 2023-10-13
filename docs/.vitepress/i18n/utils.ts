import { langMap } from './locales'

export function t(key: string, lang: string) {
  return langMap[lang]?.[key] || key
}

export function createI18n(lang: string) {
  return (key: string) => t(key, lang)
}
