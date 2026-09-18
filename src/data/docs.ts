export type DocEntry = {
  title: string
  href: `/docs/api${string}`
  description: string
  chooseWhen?: string
  applicationOwns?: string
}

export type DocGroup = {
  title: string
  href: `/docs/api/${string}`
  description: string
  chooserColumnTitle?: string
  chooserTitle?: string
  entries: readonly DocEntry[]
}

export type DocPackage = {
  title: `@hulla/${string}`
  href: `/docs/${string}`
  description: string
  groups: readonly DocGroup[]
}

export type DocNavigationSection = {
  title: string
  groups: readonly DocGroup[]
}

export const API_VERSION = '2.0.0'

export const apiDocs: readonly DocGroup[] = [
  {
    title: 'Start here',
    href: '/docs/api/start-here',
    description:
      'Understand the contract-first model, install the smallest boundary, and migrate from the retired procedure API.',
    entries: [
      {
        title: 'Introduction',
        href: '/docs/api',
        description: 'Why choose @hulla/api and how it compares.',
      },
      {
        title: 'Installation',
        href: '/docs/api/installation',
        description: 'Validated core, server adapters, and client transports.',
      },
      {
        title: 'Quick start',
        href: '/docs/api/quick-start',
        description: 'Build a small task API and make the first typed call.',
      },
      {
        title: 'Mental model',
        href: '/docs/api/mental-model',
        description:
          'Architecture, request flow, ownership, and file boundaries.',
      },
      {
        title: 'Migration guide',
        href: '/docs/api/start/migration',
        description: 'Move a stable 1.x procedure to the 2.0 contract model.',
      },
    ],
  },
  {
    title: 'Fundamentals',
    href: '/docs/api/core',
    description:
      'Define what crosses the API boundary, implement it on the server, and consume it from application code.',
    entries: [
      {
        title: 'API contracts',
        href: '/docs/api/core/contracts',
        description:
          'Shared paths, request inputs, and status-specific responses.',
      },
      {
        title: 'Implementing the server',
        href: '/docs/api/core/servers',
        description:
          'Write a handler for every route and produce declared responses.',
      },
      {
        title: 'Server context & middleware',
        href: '/docs/api/core/server-context',
        description:
          'Request-scoped values, policy, scopes, and execution order.',
      },
      {
        title: 'Organizing server code',
        href: '/docs/api/core/server-composition',
        description:
          'Split handlers into modules and compose independently owned routes.',
      },
      {
        title: 'Request and response data',
        href: '/docs/api/core/request-transport',
        description:
          'Path parameters, query values, headers, bodies, and native JSON.',
      },
      {
        title: 'Validation and serialization',
        href: '/docs/api/core/value-round-trips',
        description: 'One-way schemas, transforms, and bidirectional codecs.',
      },
      {
        title: 'Error handling',
        href: '/docs/api/core/errors',
        description: 'Declared application failures and operational errors.',
      },
      {
        title: 'Calling the API',
        href: '/docs/api/core/clients',
        description:
          'Create a callable API client, send requests, and handle each declared response.',
      },
    ],
  },
  {
    title: 'Server adapters',
    href: '/docs/api/servers',
    description:
      'Connect a server implementation to Node.js or an existing server framework.',
    entries: [
      {
        title: 'Node.js HTTP',
        href: '/docs/api/servers/node-http',
        description:
          'A contract-backed listener for the built-in Node HTTP server.',
      },
      {
        title: 'Express',
        href: '/docs/api/servers/express',
        description:
          'Existing Express apps and routers with host-owned middleware and parsing.',
      },
      {
        title: 'Fastify',
        href: '/docs/api/servers/fastify',
        description:
          'Plugin-scoped contract routes with Fastify hooks, parsers, and context.',
      },
      {
        title: 'Hono',
        href: '/docs/api/servers/hono',
        description:
          'Contract routes with Hono middleware, cached bodies, and typed context.',
      },
      {
        title: 'H3',
        href: '/docs/api/servers/h3',
        description:
          'Contract routes on H3 v2 with native middleware and event context.',
      },
      {
        title: 'Elysia',
        href: '/docs/api/servers/elysia',
        description:
          'Contract routes with native lifecycle hooks and typed extensions.',
      },
      {
        title: 'Koa',
        href: '/docs/api/servers/koa',
        description:
          'Terminal Koa middleware with typed state and native context.',
      },
      {
        title: 'NestJS',
        href: '/docs/api/servers/nestjs',
        description: 'Nest controllers, DI, and Express or Fastify platforms.',
      },
    ],
  },
  {
    title: 'Full-stack frameworks',
    href: '/docs/api/full-stack',
    description:
      'Keep server-only code out of browser bundles and choose local or HTTP calls at each render boundary.',
    entries: [
      {
        title: 'Server and browser calls',
        href: '/docs/api/full-stack/hybrid-rendering',
        description: 'Choose local, framework-native, or HTTP boundaries.',
      },
      {
        title: 'Next.js',
        href: '/docs/api/full-stack/next',
        description: 'App Router Route Handlers and native request context.',
      },
      {
        title: 'Next.js data and caching',
        href: '/docs/api/full-stack/next-data',
        description: 'Data Cache policy, invalidation, and browser boundaries.',
      },
      {
        title: 'TanStack Start',
        href: '/docs/api/full-stack/tanstack-start',
        description: 'Server routes, loaders, and server-function boundaries.',
      },
      {
        title: 'React Router',
        href: '/docs/api/full-stack/react-router',
        description:
          'Resource routes, colocated loaders, and revalidation boundaries.',
      },
      {
        title: 'SolidStart',
        href: '/docs/api/full-stack/solid-start',
        description: 'API routes, server queries, and native event context.',
      },
      {
        title: 'SvelteKit',
        href: '/docs/api/full-stack/sveltekit',
        description:
          'Catch-all endpoints, enhanced Fetch, and RequestEvent context.',
      },
      {
        title: 'SvelteKit remote functions',
        href: '/docs/api/full-stack/sveltekit-remote-functions',
        description: 'Application-local query, command, and form callbacks.',
      },
      {
        title: 'Nuxt',
        href: '/docs/api/full-stack/nuxt',
        description: 'Nitro routes, request-aware clients, and useAsyncData.',
      },
      {
        title: 'Astro',
        href: '/docs/api/full-stack/astro',
        description: 'Endpoints, browser Fetch, and server-side reuse.',
      },
    ],
  },
  {
    title: 'Serverless',
    href: '/docs/api/runtimes',
    description:
      'Deploy through serverless functions, edge workers, or runtime-managed Fetch hosts.',
    entries: [
      {
        title: 'Choose a web runtime',
        href: '/docs/api/runtimes/runtime-hosts',
        description: 'Choose a Fetch-compatible host boundary.',
      },
      {
        title: 'Bun',
        href: '/docs/api/runtimes/bun',
        description: 'Run a Fetch handler with Bun.serve().',
      },
      {
        title: 'Deno',
        href: '/docs/api/runtimes/deno',
        description: 'Run a Fetch handler with deno serve or Deno.serve().',
      },
      {
        title: 'Vercel Functions',
        href: '/docs/api/runtimes/vercel',
        description: 'Export a standalone Web Handler from api/.',
      },
      {
        title: 'Cloudflare Workers',
        href: '/docs/api/runtimes/cloudflare',
        description: 'Contract routes in a Module Worker fetch handler.',
      },
      {
        title: 'Cloudflare Pages Functions',
        href: '/docs/api/runtimes/cloudflare-pages',
        description: 'Contract routes in a file-routed Pages Function.',
      },
      {
        title: 'AWS Lambda',
        href: '/docs/api/runtimes/aws-lambda',
        description: 'Buffered HTTP API v2 and Function URL handlers.',
      },
      {
        title: 'Azure Functions',
        href: '/docs/api/runtimes/azure-functions',
        description: 'Node.js v4 HTTP triggers and invocation context.',
      },
      {
        title: 'Google Cloud Run functions',
        href: '/docs/api/runtimes/google-cloud-functions',
        description:
          'HTTP entrypoints, raw bodies, and native response streaming.',
      },
      {
        title: 'Netlify Functions',
        href: '/docs/api/runtimes/netlify-functions',
        description: 'Function paths, native context, and Web responses.',
      },
    ],
  },
  {
    title: 'Client connections',
    href: '/docs/api/transports',
    description:
      'Choose how application code reaches the server: HTTP, the same process, IPC, or WebSocket.',
    chooserColumnTitle: 'Connection',
    chooserTitle: 'Choose how the client connects',
    entries: [
      {
        title: 'HTTP calls with Fetch',
        href: '/docs/api/transports/fetch',
        description:
          'Call an HTTP API with web-standard Request, Response, and fetch.',
        chooseWhen:
          'The caller reaches the server over HTTP or already uses Fetch APIs.',
        applicationOwns: 'Authentication, cookies, retries, and the base URL.',
      },
      {
        title: 'Same-process calls',
        href: '/docs/api/transports/in-process',
        description:
          'Call server code directly without opening a network connection.',
        chooseWhen: 'The caller can safely import the server implementation.',
        applicationOwns: 'Server-only module placement and process lifetime.',
      },
      {
        title: 'Workers and IPC',
        href: '/docs/api/transports/message-port',
        description:
          'Connect workers, Electron processes, or another MessagePort endpoint.',
        chooseWhen:
          'The caller and server communicate through MessagePort-style IPC.',
        applicationOwns: 'Port transfer, access policy, and port lifetime.',
      },
      {
        title: 'WebSocket connections',
        href: '/docs/api/transports/websocket',
        description:
          'Send requests, responses, streams, and cancellation over a socket.',
        chooseWhen: 'Calls need a dedicated long-lived network connection.',
        applicationOwns:
          'Upgrades, authentication, origin checks, and reconnects.',
      },
      {
        title: 'Desktop IPC bridges',
        href: '/docs/api/transports/desktop-bridges',
        description:
          'Connect Electron, Tauri, Dioxus, or a JSON-only native bridge.',
        chooseWhen:
          'A desktop host must hand calls between web and native processes.',
        applicationOwns:
          'Native routing, capabilities, handoff, and host shutdown.',
      },
    ],
  },
  {
    title: 'Integrations',
    href: '/docs/api/integrations',
    description:
      'Connect @hulla/api to result types, query caches, and other ecosystem tools.',
    entries: [
      {
        title: 'Result-based calls',
        href: '/docs/api/integrations/control',
        description:
          'Represent typed client outcomes with @hulla/control Result values.',
      },
      {
        title: 'Choosing a query cache',
        href: '/docs/api/integrations/query-libraries',
        description: 'Compare TanStack Query, SWR, and direct API calls.',
      },
      {
        title: 'TanStack Query',
        href: '/docs/api/integrations/tanstack-query',
        description: 'Typed option objects, cancellation, and invalidation.',
      },
      {
        title: 'SWR',
        href: '/docs/api/integrations/swr',
        description: 'Typed key/fetcher tuples, mutations, and revalidation.',
      },
    ],
  },
  {
    title: 'OpenAPI tooling',
    href: '/docs/api/tooling',
    description:
      'Generate OpenAPI from a contract or generate a contract from an existing API description.',
    entries: [
      {
        title: 'OpenAPI overview',
        href: '/docs/api/integrations/openapi',
        description:
          'Choose whether the contract or OpenAPI document is the source of truth.',
      },
      {
        title: 'Generate OpenAPI',
        href: '/docs/api/integrations/openapi/export',
        description:
          'Generate a JSON or YAML document from a contract and typed sidecar.',
      },
      {
        title: 'Generate from OpenAPI',
        href: '/docs/api/integrations/openapi/import',
        description:
          'Generate a runtime contract and sidecar from an existing document.',
      },
    ],
  },
  {
    title: 'Reference',
    href: '/docs/api/reference',
    description:
      'Inspect compiled route metadata, host-owned behavior, and public package boundaries.',
    entries: [
      {
        title: 'Contract internals',
        href: '/docs/api/reference/architecture',
        description:
          'Flat route manifests, inherited paths, selections, and compiler types.',
      },
      {
        title: '2.0 migration reference',
        href: '/docs/api/reference/migration',
        description:
          'Removed APIs, package moves, and behavior changes in @hulla/api 2.0.',
      },
      {
        title: 'Adapter requirements',
        href: '/docs/api/reference/adapter-conformance',
        description:
          'Routing, request bodies, streaming, cancellation, and host ownership.',
      },
      {
        title: 'Package exports',
        href: '/docs/api/reference/exports',
        description:
          'Core subpaths, integration packages, and import boundaries.',
      },
    ],
  },
] as const

function findNavigationGroup(href: DocGroup['href']): DocGroup {
  const group = apiDocs.find((candidate) => candidate.href === href)
  if (!group) throw new Error(`Unknown documentation group: ${href}`)
  return group
}

/**
 * Sidebar information architecture. Documentation groups stay flat in
 * `apiDocs` so group landing pages, pagination, and AI exports keep one source
 * of truth; this model adds the user-facing category layer only where it helps
 * people scan the documentation.
 */
export const apiDocNavigation: readonly DocNavigationSection[] = [
  {
    title: 'Start here',
    groups: [findNavigationGroup('/docs/api/start-here')],
  },
  {
    title: 'Fundamentals',
    groups: [findNavigationGroup('/docs/api/core')],
  },
  {
    title: 'Server',
    groups: [
      findNavigationGroup('/docs/api/servers'),
      findNavigationGroup('/docs/api/full-stack'),
      findNavigationGroup('/docs/api/runtimes'),
    ],
  },
  {
    title: 'Client',
    groups: [findNavigationGroup('/docs/api/transports')],
  },
  {
    title: 'Integrations',
    groups: [findNavigationGroup('/docs/api/integrations')],
  },
  {
    title: 'OpenAPI tooling',
    groups: [findNavigationGroup('/docs/api/tooling')],
  },
  {
    title: 'Reference',
    groups: [findNavigationGroup('/docs/api/reference')],
  },
]

export const apiPackage: DocPackage = {
  title: '@hulla/api',
  href: '/docs/api',
  description:
    'Declare one HTTP contract, then bind typed clients and exhaustive servers to the boundaries your application chooses.',
  groups: apiDocs,
}

export const docPackages: readonly DocPackage[] = [apiPackage]

export const flatApiDocs = apiDocs.flatMap((group) => group.entries)

export function findDoc(pathname: string): DocEntry | undefined {
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  return flatApiDocs.find((entry) => entry.href === normalized)
}

export function findDocGroup(pathname: string): DocGroup | undefined {
  const current = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  return apiDocs.find((group) =>
    group.entries.some((entry) => entry.href === current)
  )
}

export function findDocGroupPage(pathname: string): DocGroup | undefined {
  const current = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  return apiDocs.find((group) => group.href === current)
}

export function adjacentDocs(pathname: string) {
  const current = findDoc(pathname)
  const index = current ? flatApiDocs.indexOf(current) : -1

  return {
    previous: index > 0 ? flatApiDocs[index - 1] : undefined,
    next: index >= 0 ? flatApiDocs[index + 1] : undefined,
  }
}
