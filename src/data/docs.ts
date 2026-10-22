export type DocEntry = {
  title: string
  href: `/docs/${string}`
  description: string
  chooseWhen?: string
  applicationOwns?: string
}

export type DocGroup = {
  area?: 'guides' | 'reference'
  title: string
  href: `/docs/${string}`
  description: string
  chooserColumnTitle?: string
  chooserTitle?: string
  entries: readonly DocEntry[]
}

export type DocPackage = {
  kind: 'api' | 'ui' | 'cli' | 'control' | 'style' | 'db' | 'args'
  title: `@hulla/${string}` | 'hulla CLI'
  href: `/docs/${string}`
  description: string
  status?: string
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
    area: 'reference',
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
  kind: 'api',
  title: '@hulla/api',
  href: '/docs/api',
  description:
    'Declare one HTTP contract, then bind typed clients and exhaustive servers to the boundaries your application chooses.',
  groups: apiDocs,
  status: 'Beta',
}

export const dbGuides: readonly DocGroup[] = [
  {
    title: 'Get started',
    href: '/docs/db/guides',
    description:
      'Typed PostgreSQL access and live browser queries, from setup to a working app.',
    entries: [
      {
        title: 'Introduction',
        href: '/docs/db',
        description: 'Choose direct server access or a live browser view.',
      },
      {
        title: 'Installation',
        href: '/docs/db/installation',
        description: 'Prepare packages, tools and PostgreSQL.',
      },
      {
        title: 'Quick start',
        href: '/docs/db/quick-start',
        description: 'Save a task and watch two browser tabs update.',
      },
      {
        title: 'Mental model',
        href: '/docs/db/mental-model',
        description: 'Understand the server, service and browser boundaries.',
      },
    ],
  },
  {
    title: 'Database',
    href: '/docs/db/database-guides',
    description:
      'Define storage rules, read rows and expose the database functions your UI needs.',
    entries: [
      {
        title: 'Schemas and constraints',
        href: '/docs/db/schemas',
        description: 'Declare fields, keys, relationships and storage rules.',
      },
      {
        title: 'Data types and codecs',
        href: '/docs/db/data-types',
        description: 'Choose precise numbers, dates, JSON and conversions.',
      },
      {
        title: 'Read and write data',
        href: '/docs/db/database',
        description: 'Filter, select, insert and group transactional writes.',
      },
      {
        title: 'Queries and mutations',
        href: '/docs/db/functions',
        description: 'Declare validated browser-callable reads and writes.',
      },
      {
        title: 'Live queries and pagination',
        href: '/docs/db/live-queries',
        description:
          'Observe results, append stable pages and handle reconnects.',
      },
      {
        title: 'Optimistic updates',
        href: '/docs/db/optimistic-writes',
        description: 'Predict an existing query result while a write runs.',
      },
      {
        title: 'Code generation',
        href: '/docs/db/code-generation',
        description: 'Know what is discovered, generated and imported.',
      },
    ],
  },
  {
    title: 'Integrations',
    href: '/docs/db/integrations',
    description:
      'Connect framework lifecycles, server rendering and your existing auth provider.',
    entries: [
      {
        title: 'Frameworks & SSR',
        href: '/docs/db/framework-bindings',
        description: 'Use framework reactivity and authorized initial data.',
      },
      {
        title: 'Full-stack recipes',
        href: '/docs/db/meta-frameworks',
        description: 'Choose a complete framework setup.',
      },
      {
        title: 'Next.js',
        href: '/docs/db/frameworks/next',
        description: 'Use Server Components and React live hooks.',
      },
      {
        title: 'Nuxt',
        href: '/docs/db/frameworks/nuxt',
        description: 'Connect Nitro reads and Vue components.',
      },
      {
        title: 'SvelteKit',
        href: '/docs/db/frameworks/sveltekit',
        description: 'Connect server loaders and reactive Svelte views.',
      },
      {
        title: 'SolidStart',
        href: '/docs/db/frameworks/solidstart',
        description: 'Connect server functions and Solid resources.',
      },
      {
        title: 'Astro',
        href: '/docs/db/frameworks/astro',
        description: 'Hydrate a live island over request-time rows.',
      },
      {
        title: 'Authentication',
        href: '/docs/db/authentication',
        description: 'Verify credentials and scope data to the caller.',
      },
      {
        title: 'Better Auth storage',
        href: '/docs/db/better-auth',
        description: 'Store provider users and sessions in PostgreSQL.',
      },
    ],
  },
  {
    title: 'Run and deploy',
    href: '/docs/db/operations',
    description:
      'Run the supplied service and package it for a compatible host.',
    entries: [
      {
        title: 'Database service',
        href: '/docs/db/runtime',
        description: 'Configure listeners, browser connections and budgets.',
      },
      {
        title: 'Deployment',
        href: '/docs/db/deployment',
        description: 'Deploy the app, persistent service and PostgreSQL.',
      },
    ],
  },
]

const packageGuides: readonly DocGroup[] = [
  {
    title: 'Get started',
    href: '/docs/control/guides',
    description:
      'Return failures as values and compose operations that can fail.',
    entries: [
      {
        title: 'Introduction',
        href: '/docs/control',
        description: 'Choose when to return a Result.',
      },
      {
        title: 'Quick start',
        href: '/docs/control/quick-start',
        description: 'Return and handle your first success or failure.',
      },
      {
        title: 'Results',
        href: '/docs/control/results',
        description:
          'Construct results, narrow outcomes, and read values safely.',
      },
      {
        title: 'Chaining operations',
        href: '/docs/control/chaining',
        description: 'Transform successful values and stop on failures.',
      },
      {
        title: 'Catching exceptions',
        href: '/docs/control/attempts',
        description:
          'Convert throwing functions and promises to Result values.',
      },
      {
        title: 'Asynchronous results',
        href: '/docs/control/async',
        description:
          'Choose between promises of results and results containing promises.',
      },
    ],
  },
  {
    title: 'Get started',
    href: '/docs/style/guides',
    description:
      'Build reusable class recipes, add variants, and choose how classes merge.',
    entries: [
      {
        title: 'Introduction',
        href: '/docs/style',
        description: 'Choose a class composer and reusable variant recipes.',
      },
      {
        title: 'Quick start',
        href: '/docs/style/quick-start',
        description: 'Create a button recipe and use its class string.',
      },
      {
        title: 'Variants',
        href: '/docs/style/variants',
        description: 'Add named choices, defaults, and conditional classes.',
      },
      {
        title: 'Composition',
        href: '/docs/style/composition',
        description: 'Reuse and extend class recipes.',
      },
      {
        title: 'Custom merging',
        href: '/docs/style/custom-merging',
        description: 'Configure the class composer for your CSS system.',
      },
    ],
  },
  dbGuides[0]!,
  {
    title: 'Get started',
    href: '/docs/cli/guides',
    description:
      'Configure a project, install source components, and run repeatable commands.',
    entries: [
      {
        title: 'Introduction',
        href: '/docs/cli',
        description:
          'Choose a project workflow and understand beta compatibility.',
      },
      {
        title: 'Quick start',
        href: '/docs/cli/quick-start',
        description: 'Initialize a project and install a source component.',
      },
      {
        title: 'Configuration',
        href: '/docs/cli/configuration',
        description: 'Understand project config, subsystem paths, and caches.',
      },
      {
        title: 'UI components',
        href: '/docs/cli/ui',
        description:
          'Initialize a registry, add components, and inspect updates.',
      },
      {
        title: 'API generation',
        href: '/docs/cli/api',
        description:
          'Understand the legacy generator boundary and compatibility limits.',
      },
      {
        title: 'CI and troubleshooting',
        href: '/docs/cli/automation',
        description: 'Run without prompts and diagnose installation failures.',
      },
    ],
  },
  {
    title: 'Get started',
    href: '/docs/args/guides',
    description:
      'Parse command-line input into typed options, commands, and validated values.',
    entries: [
      {
        title: 'Introduction',
        href: '/docs/args',
        description: 'Understand declarations and parsed argument results.',
      },
      {
        title: 'Quick start',
        href: '/docs/args/quick-start',
        description: 'Build and invoke a small command-line program.',
      },
      {
        title: 'Arguments',
        href: '/docs/args/arguments',
        description: 'Read named values, switches, and positional input.',
      },
      {
        title: 'Parser options',
        href: '/docs/args/options',
        description:
          'Control argument slicing, name matching, and shared arguments.',
      },
      {
        title: 'Commands',
        href: '/docs/args/commands',
        description: 'Organize subcommands and read their parsed results.',
      },
      {
        title: 'Validation',
        href: '/docs/args/validation',
        description: 'Validate input and handle parser errors.',
      },
      {
        title: 'Build a CLI',
        href: '/docs/args/recipes',
        description:
          'Implement command routing, required input, validation, and exit codes.',
      },
    ],
  },
]

const packageReferences: readonly DocGroup[] = [
  {
    title: 'Reference',
    area: 'reference',
    href: '/docs/control/reference-overview',
    description:
      'Look up result constructors, methods, types, and callback behavior.',
    entries: [
      {
        title: 'API reference',
        href: '/docs/control/reference',
        description: 'Constructors, tags, methods, and public result types.',
      },
    ],
  },
  {
    title: 'Reference',
    area: 'reference',
    href: '/docs/style/reference-overview',
    description:
      'Look up class inputs, variant types, and customization hooks.',
    entries: [
      {
        title: 'API reference',
        href: '/docs/style/reference',
        description:
          'Supported class inputs, helpers, serializers, and composers.',
      },
    ],
  },
  {
    title: 'Reference',
    area: 'reference',
    href: '/docs/db/reference-overview',
    description:
      'Look up Rust and TypeScript entrypoints, database operations, and runtime options.',
    entries: [
      {
        title: 'API reference',
        href: '/docs/db/reference',
        description:
          'Schema, server, generation, runtime, and lifecycle contracts.',
      },
      {
        title: 'Native Rust applications',
        href: '/docs/db/rust',
        description: 'Use the native facade and its own runtime lifecycle.',
      },
    ],
  },
  {
    title: 'Reference',
    area: 'reference',
    href: '/docs/cli/reference-overview',
    description:
      'Look up implemented commands, aliases, flags, and configuration fields.',
    entries: [
      {
        title: 'Command reference',
        href: '/docs/cli/reference',
        description:
          'Implemented command behavior and exact configuration defaults.',
      },
    ],
  },
  {
    title: 'Reference',
    area: 'reference',
    href: '/docs/args/reference-overview',
    description:
      'Look up argument declarations, parser settings, output records, and errors.',
    entries: [
      {
        title: 'API reference',
        href: '/docs/args/reference',
        description:
          'Constructors, settings, parsed metadata, and ParserError fields.',
      },
    ],
  },
]

export const docPackages: readonly DocPackage[] = [
  apiPackage,
  {
    kind: 'ui',
    title: '@hulla/ui',
    href: '/docs/ui',
    description: 'Source-owned components for Astro, React, and Solid.',
    groups: [],
  },
  ...packageGuides.map((group): DocPackage => {
    const kind = group.href.split('/')[2] as Exclude<
      DocPackage['kind'],
      'api' | 'ui'
    >
    return {
      kind,
      title: kind === 'cli' ? 'hulla CLI' : `@hulla/${kind}`,
      href: `/docs/${kind}`,
      description: group.description,
      groups: [
        group,
        ...(kind === 'db' ? dbGuides.slice(1) : []),
        ...packageReferences.filter((reference) =>
          reference.href.startsWith(`/docs/${kind}/`)
        ),
      ],
      ...(kind === 'db'
        ? { status: 'Private' }
        : kind === 'cli'
          ? { status: 'Beta' }
          : {}),
    }
  }),
]

export const docGroups = docPackages.flatMap((pkg) => pkg.groups)

export const flatApiDocs = apiDocs.flatMap((group) => group.entries)
export const flatDocs = docGroups.flatMap((group) => group.entries)

export function findDocPackage(pathname: string): DocPackage | undefined {
  return docPackages.find(
    (pkg) => pathname === pkg.href || pathname.startsWith(`${pkg.href}/`)
  )
}

export function findDoc(pathname: string): DocEntry | undefined {
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  return flatDocs.find((entry) => entry.href === normalized)
}

export function findDocGroup(pathname: string): DocGroup | undefined {
  const current = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  return docGroups.find((group) =>
    group.entries.some((entry) => entry.href === current)
  )
}

export function findDocGroupPage(pathname: string): DocGroup | undefined {
  const current = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  return docGroups.find((group) => group.href === current)
}

export function adjacentDocs(pathname: string) {
  const current = findDoc(pathname)
  const pages =
    findDocPackage(pathname)?.groups.flatMap((group) => group.entries) ?? []
  const index = current ? pages.indexOf(current) : -1

  return {
    previous: index > 0 ? pages[index - 1] : undefined,
    next: index >= 0 ? pages[index + 1] : undefined,
  }
}
