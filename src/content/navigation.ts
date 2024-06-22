// this acts as a sort-directive for DocsMenu, if a key key is missing, then it's appended to the bottom
const CATEGORIES = [
  'Getting Started',
  'Core Concepts',
  'Advanced',
  'Integrations',
  'Examples',
  'Reference',
] as const

const api: {
  [K in (typeof CATEGORIES)[number]]: {
    label: string
    url: string
  }[]
} = {
  'Getting Started': [
    { label: 'About', url: '' },
    { label: 'Installation', url: '/getting-started/installation' },
    { label: 'Quick-start', url: '/getting-started/quickstart' },
  ],
  'Core Concepts': [
    { label: 'Procedures', url: '/core-concepts/procedures' },
    { label: 'Router', url: '/core-concepts/router' },
    { label: 'Overview & Lifecycle', url: '/core-concepts/lifecycle' },
  ],
  Advanced: [
    { label: 'Resolvers', url: '/advanced/resolvers' },
    { label: 'Context', url: '/advanced/context' },
    { label: 'Interceptors', url: '/advanced/interceptors' },
    { label: 'Adapters', url: '/advanced/adapters' },
    { label: 'Custom Methods', url: '/advanced/custom' },
  ],
  Integrations: [
    { label: 'Requests', url: 'integrations/requests' },
    { label: '@tanstack/query', url: 'integrations/query' },
    { label: 'swr', url: 'integrations/swr' },
  ],
  Examples: [
    { label: 'React', url: 'examples/react' },
    { label: 'Next', url: 'examples/next' },
    { label: 'Astro', url: 'examples/astro' },
    { label: 'Remix (React Router)', url: 'examples/remix' },
    { label: 'Solid & Solid Router', url: 'examples/solid' },
    { label: 'Vue & Nuxt', url: 'examples/vue' },
    { label: 'React Native & Expo', url: 'examples/native' },
  ],
  Reference: [],
}

const ui = {}
const create = {}
const forms = {}
const ts = {}
const docs = {}
const env = {}

export const NAVIGATION = {
  api,
  ui,
  env,
  create,
  forms,
  docs,
  ts,
}
