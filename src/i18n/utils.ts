import { defaultLanguage, ui } from './ui'
import { keys } from '@/utils/objects'

export function getLanguage(url: URL) {
  const [, lang] = url.pathname.split('/')
  if (lang && lang in ui) return lang as keyof typeof ui
  return defaultLanguage
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLanguage]) {
    // safe to type-cast, if the key is not found, it will return the default language
    return ui[lang][key] || (ui[defaultLanguage][key] as string)
  }
}

export function getStaticPaths() {
  return keys(ui).map((lang) => ({ params: { lang } }))
}
