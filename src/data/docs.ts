export type DocEntry = {
  title: string
  href: `/docs/api${string}`
  description: string
}

export type DocGroup = {
  title: string
  href: `/docs/api/${string}`
  description: string
  entries: readonly DocEntry[]
}

export type DocPackage = {
  title: `@hulla/${string}`
  href: `/docs/${string}`
  description: string
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
        description: 'What @hulla/api owns and where it fits.',
      },
      {
        title: 'Installation',
        href: '/docs/api/installation',
        description:
          'Core entrypoints, optional packages, and runtime support.',
      },
      {
        title: 'Quick start',
        href: '/docs/api/quick-start',
        description: 'Declare, implement, and call one complete contract.',
      },
      {
        title: 'Mental model',
        href: '/docs/api/mental-model',
        description:
          'Contracts, implementations, adapters, clients, and transports.',
      },
      {
        title: 'Migration guide',
        href: '/docs/api/start/migration',
        description:
          'Move from procedures and builders to contract selections.',
      },
    ],
  },
  {
    title: 'Core API',
    href: '/docs/api/core',
    description:
      'Declare the boundary, implement its behavior, construct clients, and control values and failures.',
    entries: [
      {
        title: 'Contracts',
        href: '/docs/api/core/contracts',
        description: 'Paths, inputs, responses, routers, and shared schemas.',
      },
      {
        title: 'Server implementations',
        href: '/docs/api/core/servers',
        description: 'Exhaustive handlers, middleware, context, and fragments.',
      },
      {
        title: 'Typed clients',
        href: '/docs/api/core/clients',
        description: 'Selections, calls, middleware, and response narrowing.',
      },
      {
        title: 'Request representations',
        href: '/docs/api/core/request-transport',
        description: 'Parameters, query, headers, bodies, and native JSON.',
      },
      {
        title: 'Values across boundaries',
        href: '/docs/api/core/value-round-trips',
        description: 'One-way schemas, transforms, and bidirectional codecs.',
      },
      {
        title: 'Errors',
        href: '/docs/api/core/errors',
        description: 'Declared application failures and operational errors.',
      },
    ],
  },
  {
    title: 'Transports',
    href: '/docs/api/transports',
    description:
      'Carry the same typed client call over Fetch, in process, IPC, or WebSocket.',
    entries: [
      {
        title: 'Fetch',
        href: '/docs/api/transports/fetch',
        description: 'Web-standard client transport and server adapter.',
      },
      {
        title: 'In-process',
        href: '/docs/api/transports/in-process',
        description: 'Zero-network calls through the contract lifecycle.',
      },
      {
        title: 'MessagePort',
        href: '/docs/api/transports/message-port',
        description: 'Workers, Electron, and ordered IPC endpoints.',
      },
      {
        title: 'WebSocket',
        href: '/docs/api/transports/websocket',
        description:
          'Requests, responses, streams, and cancellation over sockets.',
      },
      {
        title: 'Desktop bridges',
        href: '/docs/api/transports/desktop-bridges',
        description: 'Electron, Tauri, Dioxus, and custom JSON relays.',
      },
    ],
  },
  {
    title: 'Server frameworks',
    href: '/docs/api/servers',
    description:
      'Mount compiled routes while keeping routing, parsing, context, and streaming native to the host.',
    entries: [
      {
        title: 'Node.js HTTP',
        href: '/docs/api/servers/node-http',
        description: 'Dependency-free native Node HTTP mounting.',
      },
      {
        title: 'Express',
        href: '/docs/api/servers/express',
        description: 'Native Express routing, middleware, and response writes.',
      },
      {
        title: 'Fastify',
        href: '/docs/api/servers/fastify',
        description: 'Native Fastify routes, hooks, context, and plugins.',
      },
      {
        title: 'Hono',
        href: '/docs/api/servers/hono',
        description: 'Native Hono routes, bindings, variables, and context.',
      },
      {
        title: 'H3',
        href: '/docs/api/servers/h3',
        description: 'Native H3 routes, middleware, and event context.',
      },
      {
        title: 'Elysia',
        href: '/docs/api/servers/elysia',
        description: 'Native Elysia routes, lifecycle, decorators, and stores.',
      },
      {
        title: 'Koa',
        href: '/docs/api/servers/koa',
        description: 'Koa middleware and native context.',
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
        title: 'Hybrid rendering',
        href: '/docs/api/full-stack/hybrid-rendering',
        description:
          'Safe local and browser client placement across frameworks.',
      },
      {
        title: 'Next.js',
        href: '/docs/api/full-stack/next',
        description: 'App Router, Data Cache, Server Actions, and clients.',
      },
      {
        title: 'TanStack Start',
        href: '/docs/api/full-stack/tanstack-start',
        description: 'Server routes, loaders, and server-function boundaries.',
      },
      {
        title: 'React Router',
        href: '/docs/api/full-stack/react-router',
        description: 'Framework Mode resource routes, loaders, and actions.',
      },
      {
        title: 'SolidStart',
        href: '/docs/api/full-stack/solid-start',
        description: 'API routes, server queries, and native event context.',
      },
      {
        title: 'SvelteKit',
        href: '/docs/api/full-stack/sveltekit',
        description: 'Endpoints, enhanced Fetch, and remote functions.',
      },
      {
        title: 'Nuxt',
        href: '/docs/api/full-stack/nuxt',
        description: 'Nitro routes, request-aware clients, and useAsyncData.',
      },
      {
        title: 'Astro',
        href: '/docs/api/full-stack/astro',
        description: 'Endpoints, server components, and server islands.',
      },
    ],
  },
  {
    title: 'Serverless & runtimes',
    href: '/docs/api/runtimes',
    description:
      'Map contract execution onto platform-native requests, invocation context, responses, and limits.',
    entries: [
      {
        title: 'Cloudflare',
        href: '/docs/api/runtimes/cloudflare',
        description: 'Module Workers and Pages Functions.',
      },
      {
        title: 'AWS Lambda',
        href: '/docs/api/runtimes/aws-lambda',
        description: 'HTTP API v2 and Function URLs.',
      },
      {
        title: 'Azure Functions',
        href: '/docs/api/runtimes/azure-functions',
        description: 'Node.js v4 HTTP triggers and invocation context.',
      },
      {
        title: 'Google Cloud Run functions',
        href: '/docs/api/runtimes/google-cloud-functions',
        description: 'Functions Framework HTTP deployment.',
      },
      {
        title: 'Netlify Functions',
        href: '/docs/api/runtimes/netlify-functions',
        description: 'Web-native functions and platform context.',
      },
      {
        title: 'Bun, Deno & Vercel',
        href: '/docs/api/runtimes/runtime-hosts',
        description: 'Choose a supported runtime boundary.',
      },
    ],
  },
  {
    title: 'Integrations',
    href: '/docs/api/integrations',
    description:
      'Build optional views and development tooling around a completed contract or client.',
    entries: [
      {
        title: 'TanStack Query & SWR',
        href: '/docs/api/integrations/query-libraries',
        description:
          'Typed cache keys and executable query or mutation options.',
      },
      {
        title: 'OpenAPI',
        href: '/docs/api/integrations/openapi',
        description: 'Bidirectional contract generation and typed sidecars.',
      },
    ],
  },
  {
    title: 'Architecture & exports',
    href: '/docs/api/reference',
    description:
      'Inspect architecture, host ownership, conformance guarantees, and public package boundaries.',
    entries: [
      {
        title: 'Architecture',
        href: '/docs/api/reference/architecture',
        description:
          'Call graphs, compilation, selection, and dependency rules.',
      },
      {
        title: 'Adapter behavior',
        href: '/docs/api/reference/adapter-conformance',
        description: 'Executable conformance and host-owned behavior.',
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
