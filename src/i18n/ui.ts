export const languages = {
  en: 'English',
  sk: 'Slovenčina',
  cz: 'Čeština',
}

export const defaultLanguage: keyof typeof languages = 'en'

type DefaultLanguage = typeof defaultLanguage

type Content = {
  home: {
    bento: 'about' | 'about.description'
  }
}

type ContentKeys =
  `${keyof Content}.${keyof Content[keyof Content]}.${Content[keyof Content][keyof Content[keyof Content]]}`

type UI = {
  [K in keyof typeof languages]: K extends DefaultLanguage
    ? {
        [Key in ContentKeys]: string
      }
    : Partial<{
        [Key in ContentKeys]: string
      }>
}

export const ui: UI = {
  en: {
    'home.bento.about': 'About me',
    'home.bento.about.description':
      "Hello, I'm Samuel Hulla, a web developer. I'm glad you're here!",
  },
  sk: {
    'home.bento.about': 'O mne',
    'home.bento.about.description': 'Dozvi sa o mne viacej info',
  },
  cz: {
    'home.bento.about': 'O mne',
    'home.bento.about.description': 'Chceš se o mně dozvědět víc?',
  },
} as const
