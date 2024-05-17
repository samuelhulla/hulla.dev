import type { languages } from './ui'

export const keywords = {
  en: 'Samuel Hulla, Portfolio, hulla@hulla.dev, hulla, docugen, tastier, @tastier, qman, tsbase, @tsbase, web developer, astro, 3d website, buy website',
  sk: 'Samuel Hulla, Portfólio, hulla@hulla.dev, hulla, docugen, tastier, @tastier, qman, tsbase, @tsbase, vyvojar, web developer, astro, 3d stranka, kupit stranku',
  cz: 'Samuel Hulla, Portfólio, hulla@hulla.dev, hulla, docugen, tastier, @tastier, qman, tsbase, @tsbase, vyvojar, web developer, astro, 3d stranka, kupit stranku',
} satisfies { [key in keyof typeof languages]: string }

export const description = {
  en: "Samuel Hulla's portfolio, hulla.dev",
  sk: 'Samuel Hulla - Portfolio, hulla.dev',
  cz: 'Samuel Hulla - Portfolio, hulla.dev',
} satisfies { [key in keyof typeof languages]: string }

export const seo = {
  description,
  keywords,
}
