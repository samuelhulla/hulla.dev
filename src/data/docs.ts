import { packagePreviews } from './package-previews'

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
  kind: 'api' | 'ui' | 'cli' | 'control' | 'style' | 'db' | 'args' | 'gittar'
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
      'Get to know the API package and install it, or migrate an existing 1.x app.',
    entries: [
      {
        title: 'Introduction',
        href: '/docs/api',
        description:
          'Declare an HTTP contract once. Implement it on the server and call it with a typed client.',
      },
      {
        title: 'Installation',
        href: '/docs/api/installation',
        description:
          'Install the core package and the integration for your server.',
      },
      {
        title: 'Mental model',
        href: '/docs/api/mental-model',
        description:
          'Follow a request from the typed client to its server handler and back.',
      },
      {
        title: 'Migration guide',
        href: '/docs/api/start/migration',
        description: 'Migrate a 1.x procedure to a working 2.0 API route.',
      },
    ],
  },
  {
    title: 'Fundamentals',
    href: '/docs/api/core',
    description:
      'Define a contract, write its handlers, and make your first client call.',
    entries: [
      {
        title: 'API contracts',
        href: '/docs/api/core/contracts',
        description:
          'Define the routes, inputs, and responses that your server and client share.',
      },
      {
        title: 'Implementing the server',
        href: '/docs/api/core/servers',
        description:
          'Write handlers for your contract and call the finished server.',
      },
      {
        title: 'Server context & middleware',
        href: '/docs/api/core/server-context',
        description:
          'Share request data between handlers and add checks with middleware.',
      },
      {
        title: 'Organizing server code',
        href: '/docs/api/core/server-composition',
        description:
          'Split a large API into smaller handler files or separately mounted fragments.',
      },
      {
        title: 'Request and response data',
        href: '/docs/api/core/request-transport',
        description:
          'Turn URL parameters, headers, and request bodies into values your handlers can use.',
      },
      {
        title: 'Validation and serialization',
        href: '/docs/api/core/value-round-trips',
        description:
          'Choose how values such as dates and URLs travel between your client and server.',
      },
      {
        title: 'Error handling',
        href: '/docs/api/core/errors',
        description:
          'Handle expected API errors and diagnose unexpected failures.',
      },
      {
        title: 'Calling the API',
        href: '/docs/api/core/clients',
        description:
          'Call your API with typed input and handle the response by status.',
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
        description: 'Run your API with Node’s built-in HTTP server.',
      },
      {
        title: 'Express',
        href: '/docs/api/servers/express',
        description: 'Add your API routes to an Express app or Router.',
      },
      {
        title: 'Fastify',
        href: '/docs/api/servers/fastify',
        description: 'Register your API routes in a Fastify app.',
      },
      {
        title: 'Hono',
        href: '/docs/api/servers/hono',
        description: 'Add your API routes to a Hono app.',
      },
      {
        title: 'H3',
        href: '/docs/api/servers/h3',
        description: 'Add your API routes to an H3 v2 app.',
      },
      {
        title: 'Elysia',
        href: '/docs/api/servers/elysia',
        description: 'Add your API routes to an Elysia app.',
      },
      {
        title: 'Koa',
        href: '/docs/api/servers/koa',
        description: 'Serve your API inside a Koa middleware stack.',
      },
      {
        title: 'NestJS',
        href: '/docs/api/servers/nestjs',
        description: 'Register your API routes as Nest controller methods.',
      },
    ],
  },
  {
    title: 'Full-stack frameworks',
    href: '/docs/api/full-stack',
    description:
      'Serve your API from a framework and call it from pages and browser components.',
    entries: [
      {
        title: 'Server and browser calls',
        href: '/docs/api/full-stack/hybrid-rendering',
        description:
          'Set up a client for the browser and another for code that runs on the server.',
      },
      {
        title: 'Next.js',
        href: '/docs/api/full-stack/next',
        description: 'Serve your API from a Next.js App Router Route Handler.',
      },
      {
        title: 'Next.js data and caching',
        href: '/docs/api/full-stack/next-data',
        description:
          'Cache API requests on the Next.js server and refresh them after a write.',
      },
      {
        title: 'TanStack Start',
        href: '/docs/api/full-stack/tanstack-start',
        description: 'Serve your API from a TanStack Start server route.',
      },
      {
        title: 'React Router',
        href: '/docs/api/full-stack/react-router',
        description: 'Expose your API through a React Router resource route.',
      },
      {
        title: 'SolidStart',
        href: '/docs/api/full-stack/solid-start',
        description:
          'Add a SolidStart API route and call it from queries, actions, or the browser.',
      },
      {
        title: 'SvelteKit',
        href: '/docs/api/full-stack/sveltekit',
        description:
          'Serve your API from a SvelteKit endpoint and call it from load.',
      },
      {
        title: 'SvelteKit remote functions',
        href: '/docs/api/full-stack/sveltekit-remote-functions',
        description:
          'Call your API inside SvelteKit remote functions without an extra HTTP request.',
      },
      {
        title: 'Nuxt',
        href: '/docs/api/full-stack/nuxt',
        description:
          'Serve an API with Nitro and load its data in a Nuxt page.',
      },
      {
        title: 'Astro',
        href: '/docs/api/full-stack/astro',
        description:
          'Add an API endpoint to Astro and call it from a page or browser island.',
      },
    ],
  },
  {
    title: 'Serverless',
    href: '/docs/api/runtimes',
    description:
      'Run your API on a serverless platform or a host with Fetch support.',
    entries: [
      {
        title: 'Choose a web runtime',
        href: '/docs/api/runtimes/runtime-hosts',
        description: 'Connect a Fetch handler to Bun, Deno, or Vercel.',
      },
      {
        title: 'Bun',
        href: '/docs/api/runtimes/bun',
        description: 'Run your API with Bun.serve().',
      },
      {
        title: 'Deno',
        href: '/docs/api/runtimes/deno',
        description: 'Run your API with deno serve or Deno.serve().',
      },
      {
        title: 'Vercel Functions',
        href: '/docs/api/runtimes/vercel',
        description: 'Run your API as a standalone Vercel Function.',
      },
      {
        title: 'Cloudflare Workers',
        href: '/docs/api/runtimes/cloudflare',
        description:
          'Serve your API from a Cloudflare Worker and use its bindings.',
      },
      {
        title: 'Cloudflare Pages Functions',
        href: '/docs/api/runtimes/cloudflare-pages',
        description: 'Add your API to a Cloudflare Pages Functions project.',
      },
      {
        title: 'AWS Lambda',
        href: '/docs/api/runtimes/aws-lambda',
        description:
          'Serve your API through API Gateway HTTP API or a Lambda Function URL.',
      },
      {
        title: 'Azure Functions',
        href: '/docs/api/runtimes/azure-functions',
        description: 'Register your API as an Azure Functions v4 HTTP trigger.',
      },
      {
        title: 'Google Cloud Run functions',
        href: '/docs/api/runtimes/google-cloud-functions',
        description: 'Register your API as a Google Cloud HTTP function.',
      },
      {
        title: 'Netlify Functions',
        href: '/docs/api/runtimes/netlify-functions',
        description: 'Serve your API from a Netlify web request function.',
      },
    ],
  },
  {
    title: 'Client connections',
    href: '/docs/api/transports',
    description:
      'Connect your client to the server over HTTP, a message channel, or a direct call.',
    chooserColumnTitle: 'Connection',
    chooserTitle: 'Choose how the client connects',
    entries: [
      {
        title: 'HTTP calls with Fetch',
        href: '/docs/api/transports/fetch',
        description:
          'Send API calls over HTTP and handle them with Fetch APIs.',
        chooseWhen:
          'The caller reaches the server over HTTP or already uses Fetch APIs.',
        applicationOwns: 'Authentication, cookies, retries, and the base URL.',
      },
      {
        title: 'Same-process calls',
        href: '/docs/api/transports/in-process',
        description:
          'Call your API directly when the client and server run in the same process.',
        chooseWhen: 'The caller can safely import the server implementation.',
        applicationOwns: 'Server-only module placement and process lifetime.',
      },
      {
        title: 'Workers and IPC',
        href: '/docs/api/transports/message-port',
        description:
          'Call your API in a worker or another process through a message channel.',
        chooseWhen:
          'The caller and server communicate through MessagePort-style IPC.',
        applicationOwns: 'Port transfer, access policy, and port lifetime.',
      },
      {
        title: 'WebSocket connections',
        href: '/docs/api/transports/websocket',
        description:
          'Send typed API calls and response streams over a WebSocket.',
        chooseWhen: 'Calls need a dedicated long-lived network connection.',
        applicationOwns:
          'Upgrades, authentication, origin checks, and reconnects.',
      },
      {
        title: 'Desktop IPC bridges',
        href: '/docs/api/transports/desktop-bridges',
        description:
          'Call your API through an Electron, Tauri, or Dioxus message bridge.',
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
      'Use your API client with a query cache or Result-based error handling.',
    entries: [
      {
        title: 'Result-based calls',
        href: '/docs/api/integrations/control',
        description:
          'Handle client responses as Ok and Err values from @hulla/control.',
      },
      {
        title: 'Choosing a query cache',
        href: '/docs/api/integrations/query-libraries',
        description:
          'Add caching and loading states to your API client with TanStack Query or SWR.',
      },
      {
        title: 'TanStack Query',
        href: '/docs/api/integrations/tanstack-query',
        description:
          'Load API data with TanStack Query and invalidate it after a mutation.',
      },
      {
        title: 'SWR',
        href: '/docs/api/integrations/swr',
        description: 'Load API data with SWR and refresh it after a mutation.',
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
          'Export your contract to OpenAPI or generate a contract from an existing document.',
      },
      {
        title: 'Generate OpenAPI',
        href: '/docs/api/integrations/openapi/export',
        description:
          'Generate an OpenAPI document that other tools and teams can use.',
      },
      {
        title: 'Generate from OpenAPI',
        href: '/docs/api/integrations/openapi/import',
        description:
          'Create a typed client contract from an existing OpenAPI document.',
      },
    ],
  },
  {
    title: 'Reference',
    area: 'reference',
    href: '/docs/api/reference',
    description:
      'Look up imports, inspect routes, and compare adapter behavior.',
    entries: [
      {
        title: 'Contract internals',
        href: '/docs/api/reference/architecture',
        description: 'Inspect a contract as a flat list of routes.',
      },
      {
        title: '2.0 migration reference',
        href: '/docs/api/reference/migration',
        description:
          'Find the 2.0 replacements for 1.x imports, methods, and behavior.',
      },
      {
        title: 'Adapter requirements',
        href: '/docs/api/reference/adapter-conformance',
        description:
          'Compare routing, body parsing, errors, and cancellation across server adapters.',
      },
      {
        title: 'Package exports',
        href: '/docs/api/reference/exports',
        description:
          'Find the import path for a core API or integration package.',
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
    'Declare an HTTP contract once. Implement it on the server and call it with a typed client.',
  groups: apiDocs,
  status: 'Beta',
}

export const dbGuides: readonly DocGroup[] = [
  {
    title: 'Get started',
    href: '/docs/db/guides',
    description:
      'Set up PostgreSQL access and learn how browser queries stay up to date.',
    entries: [
      {
        title: 'Introduction',
        href: '/docs/db',
        description:
          'Read and write PostgreSQL with a typed SDK, and keep browser queries up to date automatically.',
      },
      {
        title: 'Installation',
        href: '/docs/db/installation',
        description:
          'Choose the database package and prepare the tools needed to run it locally.',
      },
      {
        title: 'Mental model',
        href: '/docs/db/mental-model',
        description:
          'Understand where your schema, server code and live browser functions run.',
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
        description:
          'Define tables once, infer application types and enforce storage rules in PostgreSQL.',
      },
      {
        title: 'Data types and codecs',
        href: '/docs/db/data-types',
        description:
          'Choose application representations for PostgreSQL values without losing precision or hiding conversions.',
      },
      {
        title: 'Read and write data',
        href: '/docs/db/database',
        description:
          'Use typed PostgreSQL builders in server code and inside query or mutation handlers.',
      },
      {
        title: 'Queries and mutations',
        href: '/docs/db/functions',
        description:
          'Declare browser-callable reads and atomic writes, with typed input and server-side validation.',
      },
      {
        title: 'Live queries and pagination',
        href: '/docs/db/live-queries',
        description:
          'Observe server query results and load more pages without shifting the rows you already loaded.',
      },
      {
        title: 'Optimistic updates',
        href: '/docs/db/optimistic-writes',
        description:
          'Show a predicted change while a mutation runs, then let the server result settle the view.',
      },
      {
        title: 'Code generation',
        href: '/docs/db/code-generation',
        description:
          'Generate typed database imports and browser functions from your schema.',
      },
    ],
  },
  {
    title: 'Integrations',
    href: '/docs/db/integrations',
    description:
      'Load database results in your framework and connect your login system.',
    entries: [
      {
        title: 'Frameworks & SSR',
        href: '/docs/db/framework-bindings',
        description:
          'Keep React, Vue, Svelte, and Solid components up to date with live queries.',
      },
      {
        title: 'Full-stack recipes',
        href: '/docs/db/meta-frameworks',
        description:
          'Render a database snapshot on the server, then keep the browser view live.',
      },
      {
        title: 'Next.js',
        href: '/docs/db/frameworks/next',
        description:
          'Use Server Components for initial rows and React hooks for live results.',
      },
      {
        title: 'Nuxt',
        href: '/docs/db/frameworks/nuxt',
        description:
          'Load rows through Nitro and keep Vue components live after hydration.',
      },
      {
        title: 'SvelteKit',
        href: '/docs/db/frameworks/sveltekit',
        description:
          'Combine server loaders with reactive Svelte queries and mutations.',
      },
      {
        title: 'SolidStart',
        href: '/docs/db/frameworks/solidstart',
        description:
          'Hand server-function results to live Solid query components.',
      },
      {
        title: 'Astro',
        href: '/docs/db/frameworks/astro',
        description:
          'Render request-time rows and hydrate an island for live database updates.',
      },
      {
        title: 'Authentication',
        href: '/docs/db/authentication',
        description:
          'Verify credentials with your auth provider and scope every browser database operation to the caller.',
      },
      {
        title: 'Better Auth storage',
        href: '/docs/db/better-auth',
        description:
          'Store Better Auth users and sessions in the same PostgreSQL database as your application.',
      },
    ],
  },
  {
    title: 'Run and deploy',
    href: '/docs/db/operations',
    description: 'Configure the query service and prepare it for deployment.',
    entries: [
      {
        title: 'Database service',
        href: '/docs/db/runtime',
        description:
          'Start the supplied query service, connect browser functions and configure the limits your app needs.',
      },
      {
        title: 'Database Studio',
        href: '/docs/db/studio',
        description:
          'Explore your schema, browse rows, and edit data in the optional local workbench.',
      },
      {
        title: 'Deployment',
        href: '/docs/db/deployment',
        description:
          'Deploy your application, persistent query service and PostgreSQL without choosing a specific cloud provider.',
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
        description:
          'Return typed success and failure values from TypeScript functions.',
      },
      {
        title: 'Results',
        href: '/docs/control/results',
        description:
          'Create success and error branches, narrow their payloads, and choose error values that fit the caller.',
      },
      {
        title: 'Chaining operations',
        href: '/docs/control/chaining',
        description:
          'Transform success and error payloads with map and mapErr while preserving the selected result branch.',
      },
      {
        title: 'Catching exceptions',
        href: '/docs/control/attempts',
        description:
          'Turn thrown exceptions and rejected promises into Result values.',
      },
      {
        title: 'Asynchronous results',
        href: '/docs/control/async',
        description:
          'Return results from async functions or keep a promise inside a result.',
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
        description: 'Join class names and define typed style variants.',
      },
      {
        title: 'Variants',
        href: '/docs/style/variants',
        description:
          'Define named style choices and infer their TypeScript types.',
      },
      {
        title: 'Composition',
        href: '/docs/style/composition',
        description: 'Join class names and add conditional styles with cn().',
      },
      {
        title: 'Custom merging',
        href: '/docs/style/custom-merging',
        description:
          'Resolve conflicting Tailwind classes with a custom composer.',
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
          'Initialize a project and copy editable UI component source into your application with the hulla CLI.',
      },
      {
        title: 'Configuration',
        href: '/docs/cli/configuration',
        description:
          'Understand the project settings and UI install records that the hulla CLI reads and writes.',
      },
      {
        title: 'UI components',
        href: '/docs/cli/ui',
        description:
          'Configure a UI registry, copy editable component files into your application, and review updates safely.',
      },
      {
        title: 'API generation',
        href: '/docs/cli/api',
        description:
          'Look up API generation commands for projects using the legacy API.',
      },
      {
        title: 'CI and troubleshooting',
        href: '/docs/cli/automation',
        description:
          'Run specified hulla CLI tasks without prompts in CI and project scripts.',
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
        description:
          'Define typed command-line arguments and inspect validated results in Node.js, Bun, Deno, or another JavaScript runtime.',
      },
      {
        title: 'Arguments',
        href: '/docs/args/arguments',
        description:
          'Match the shape of user input with flags, options, positional values, or sequences.',
      },
      {
        title: 'Parser options',
        href: '/docs/args/options',
        description:
          'Control which argv entries are read and how names, aliases, and command arguments are matched.',
      },
      {
        title: 'Commands',
        href: '/docs/args/commands',
        description:
          'Give each CLI command its own arguments, including nested commands.',
      },
      {
        title: 'Validation',
        href: '/docs/args/validation',
        description:
          'Validate command-line values with Zod and handle missing input.',
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
        description:
          'Look up the constructors, result types, methods, tags, and callback signatures exported by @hulla/control.',
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
          'Look up supported class inputs, variant types, defaults, and customization signatures in @hulla/style.',
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
          'Look up the entrypoints, result states, configuration defaults and execution limits used by the TypeScript SDK.',
      },
      {
        title: 'Native Rust applications',
        href: '/docs/db/rust',
        description:
          'Use the hulladb facade for native schema authoring, typed functions and local or remote execution.',
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
          'Look up implemented hulla CLI commands, flags, config fields, and their exact defaults.',
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
          'Look up argument constructors, parsed result fields, parser settings, and error metadata.',
      },
    ],
  },
]

const packageDefinitions: readonly DocPackage[] = [
  apiPackage,
  {
    kind: 'ui',
    title: '@hulla/ui',
    href: '/docs/ui',
    description:
      'Composable components for Astro, React, and Solid, with shared design tokens and source you own.',
    groups: [
      {
        title: 'Get started',
        href: '/docs/ui/guides',
        description: 'Install components and build a page from shared parts.',
        entries: [
          {
            title: 'Introduction',
            href: '/docs/ui',
            description:
              'Composable components for Astro, React, and Solid, with shared design tokens and source you own.',
          },
          {
            title: 'Composition and themes',
            href: '/docs/ui/composition',
            description:
              'Put component parts together and customize them with shared themes.',
          },
        ],
      },
      {
        title: 'Reference',
        area: 'reference',
        href: '/docs/ui/reference-overview',
        description: 'Find a component for the page you are building.',
        entries: [
          {
            title: 'Choose a component',
            href: '/docs/ui/components',
            description:
              'Find a shared primitive for content, navigation, forms, overlays, and feedback.',
          },
        ],
      },
    ],
  },
  {
    kind: 'gittar',
    title: '@hulla/gittar',
    href: '/docs/gittar',
    description:
      'Download repository files into a cache, then copy the files your tool needs.',
    groups: [
      {
        title: 'Get started',
        href: '/docs/gittar/guides',
        description:
          'Copy a repository snapshot and choose when to refresh it.',
        entries: [
          {
            title: 'Introduction',
            href: '/docs/gittar',
            description:
              'Download repository files into a cache, then copy the files your tool needs.',
          },
          {
            title: 'Caching and copying',
            href: '/docs/gittar/caching',
            description:
              'Pick a freshness policy, copy a subdirectory, and keep snapshots separate.',
          },
        ],
      },
      {
        title: 'Reference',
        area: 'reference',
        href: '/docs/gittar/reference-overview',
        description: 'Download options, metadata, URL forms, and errors.',
        entries: [
          {
            title: 'API reference',
            href: '/docs/gittar/reference',
            description:
              'Look up download options, cache metadata, supported URL forms, and errors.',
          },
        ],
      },
    ],
  },
  ...packageGuides.map((group): DocPackage => {
    const kind = group.href.split('/')[2] as Exclude<
      DocPackage['kind'],
      'api' | 'ui' | 'gittar'
    >
    return {
      kind,
      title: kind === 'cli' ? 'hulla CLI' : `@hulla/${kind}`,
      href: `/docs/${kind}`,
      description: group.description,
      groups: [
        {
          ...group,
          title: 'Start here',
          entries: group.entries.filter(
            (entry) => kind === 'db' || entry.href === `/docs/${kind}`
          ),
        },
        ...(kind === 'db'
          ? []
          : [
              {
                title: kind === 'cli' ? 'Workflows' : 'Concepts',
                href: `/docs/${kind}/concepts` as const,
                description:
                  kind === 'cli'
                    ? 'Configure the CLI and manage copied source.'
                    : kind === 'control'
                      ? 'Handle results, transform their values, and catch exceptions.'
                      : kind === 'style'
                        ? 'Combine classes, define variants, and resolve conflicting utilities.'
                        : 'Declare arguments, configure parsing, and validate user input.',
                entries: group.entries.filter(
                  (entry) => entry.href !== `/docs/${kind}`
                ),
              },
            ]),
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

export const docPackages: readonly DocPackage[] = packageDefinitions.map(
  (pkg) => ({
    ...pkg,
    description: packagePreviews[pkg.kind].summary,
  })
)

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
