export type CoverageEntry = {
  entrypoint: string
  /** `*` means the page owns the complete public surface of this entrypoint. */
  exports: readonly string[]
  page: `/docs/api${string}`
  anchor?: string
}

const all = ['*'] as const

export const apiCoverage = [
  { entrypoint: '@hulla/api', exports: all, page: '/docs/api/core/contracts' },
  {
    entrypoint: '@hulla/api/adapters',
    exports: all,
    page: '/docs/api/reference/adapter-conformance',
  },
  {
    entrypoint: '@hulla/api/client',
    exports: all,
    page: '/docs/api/core/clients',
  },
  {
    entrypoint: '@hulla/api/compiler',
    exports: all,
    page: '/docs/api/reference/architecture',
  },
  {
    entrypoint: '@hulla/api/errors',
    exports: all,
    page: '/docs/api/core/errors',
  },
  {
    entrypoint: '@hulla/api/fetch',
    exports: all,
    page: '/docs/api/transports/fetch',
  },
  {
    entrypoint: '@hulla/api/in-process',
    exports: all,
    page: '/docs/api/transports/in-process',
  },
  {
    entrypoint: '@hulla/api/server',
    exports: all,
    page: '/docs/api/core/servers',
  },
  {
    entrypoint: '@hulla/api/stream',
    exports: all,
    page: '/docs/api/core/request-transport',
  },
  {
    entrypoint: '@hulla/api/validation',
    exports: all,
    page: '/docs/api/core/value-round-trips',
  },
  {
    entrypoint: '@hulla/api-node',
    exports: all,
    page: '/docs/api/servers/node-http',
  },
  {
    entrypoint: '@hulla/api-node/http',
    exports: all,
    page: '/docs/api/servers/node-http',
  },
  {
    entrypoint: '@hulla/api-express',
    exports: all,
    page: '/docs/api/servers/express',
  },
  {
    entrypoint: '@hulla/api-fastify',
    exports: all,
    page: '/docs/api/servers/fastify',
  },
  {
    entrypoint: '@hulla/api-hono',
    exports: all,
    page: '/docs/api/servers/hono',
  },
  {
    entrypoint: '@hulla/api-h3',
    exports: all,
    page: '/docs/api/servers/h3',
  },
  {
    entrypoint: '@hulla/api-elysia',
    exports: all,
    page: '/docs/api/servers/elysia',
  },
  {
    entrypoint: '@hulla/api-koa',
    exports: all,
    page: '/docs/api/servers/koa',
  },
  {
    entrypoint: '@hulla/api-nestjs',
    exports: all,
    page: '/docs/api/servers/nestjs',
  },
  {
    entrypoint: '@hulla/api-next/client',
    exports: all,
    page: '/docs/api/full-stack/next-data',
  },
  {
    entrypoint: '@hulla/api-next/server',
    exports: all,
    page: '/docs/api/full-stack/next',
  },
  {
    entrypoint: '@hulla/api-tanstack-start',
    exports: all,
    page: '/docs/api/full-stack/tanstack-start',
  },
  {
    entrypoint: '@hulla/api-react-router',
    exports: all,
    page: '/docs/api/full-stack/react-router',
  },
  {
    entrypoint: '@hulla/api-solid-start',
    exports: all,
    page: '/docs/api/full-stack/solid-start',
  },
  {
    entrypoint: '@hulla/api-sveltekit/server',
    exports: all,
    page: '/docs/api/full-stack/sveltekit',
  },
  {
    entrypoint: '@hulla/api-sveltekit/remote',
    exports: all,
    page: '/docs/api/full-stack/sveltekit-remote-functions',
  },
  {
    entrypoint: '@hulla/api-nuxt/client',
    exports: all,
    page: '/docs/api/full-stack/nuxt',
  },
  {
    entrypoint: '@hulla/api-nuxt/server',
    exports: all,
    page: '/docs/api/full-stack/nuxt',
  },
  {
    entrypoint: '@hulla/api-astro',
    exports: all,
    page: '/docs/api/full-stack/astro',
  },
  {
    entrypoint: '@hulla/api-cloudflare',
    exports: all,
    page: '/docs/api/runtimes/cloudflare',
  },
  {
    entrypoint: '@hulla/api-cloudflare/pages',
    exports: all,
    page: '/docs/api/runtimes/cloudflare-pages',
  },
  {
    entrypoint: '@hulla/api-aws-lambda',
    exports: all,
    page: '/docs/api/runtimes/aws-lambda',
  },
  {
    entrypoint: '@hulla/api-azure-functions',
    exports: all,
    page: '/docs/api/runtimes/azure-functions',
  },
  {
    entrypoint: '@hulla/api-google-cloud-functions',
    exports: all,
    page: '/docs/api/runtimes/google-cloud-functions',
  },
  {
    entrypoint: '@hulla/api-netlify-functions',
    exports: all,
    page: '/docs/api/runtimes/netlify-functions',
  },
  {
    entrypoint: '@hulla/api-message-port',
    exports: all,
    page: '/docs/api/transports/message-port',
  },
  {
    entrypoint: '@hulla/api-message-port/desktop',
    exports: all,
    page: '/docs/api/transports/desktop-bridges',
  },
  {
    entrypoint: '@hulla/api-message-port/electron',
    exports: all,
    page: '/docs/api/transports/desktop-bridges',
  },
  {
    entrypoint: '@hulla/api-message-port/tauri',
    exports: all,
    page: '/docs/api/transports/desktop-bridges',
  },
  {
    entrypoint: '@hulla/api-message-port/dioxus',
    exports: all,
    page: '/docs/api/transports/desktop-bridges',
  },
  {
    entrypoint: '@hulla/api-websocket',
    exports: all,
    page: '/docs/api/transports/websocket',
  },
  {
    entrypoint: '@hulla/api-tanstack-query',
    exports: all,
    page: '/docs/api/integrations/tanstack-query',
  },
  {
    entrypoint: '@hulla/api-swr',
    exports: all,
    page: '/docs/api/integrations/swr',
  },
  {
    entrypoint: '@hulla/api-openapi',
    exports: all,
    page: '/docs/api/integrations/openapi',
  },
  {
    entrypoint: '@hulla/api-control',
    exports: [
      'createClient',
      'ClientResult',
      'ControlClient',
      'ControlClientOptions',
      'SuccessResponse',
      'FailureResponse',
      'HTTPFailure',
      'RequestFailure',
    ],
    page: '/docs/api/integrations/control',
  },
] as const satisfies readonly CoverageEntry[]
