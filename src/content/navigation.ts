// this acts as a sort-directive for DocsMenu, if a key key is missing, then it's appended to the bottom
const CATEGORIES = [
  'Getting Started',
  'Core Concepts',
  'Advanced',
  'Integrations',
  'Examples',
  'Reference',
] as const

export const api: {
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
    { label: 'Create API', url: '/core-concepts/create' },
  ],
  Advanced: [
    { label: 'Resolvers', url: '/advanced/resolvers' },
    { label: 'Context', url: '/advanced/context' },
    { label: 'Interceptors', url: '/advanced/interceptors' },
    { label: 'Adapters', url: '/advanced/adapters' },
  ],
  Integrations: [
    { label: 'Requests', url: 'integrations/requests' },
    { label: '@tanstack/query', url: 'integrations/query' },
    { label: 'swr', url: 'integrations/swr' },
  ],
  Examples: [],
  Reference: [],
}

export const NAVIGATION = {
  api,
}
