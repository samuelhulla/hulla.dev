import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const siteRoot = process.cwd()
const apiRoot = path.resolve(process.env.HULLA_API_ROOT ?? '../api')
const docsRoot = path.join(siteRoot, 'src/content/docs/api')
const repositoryUrl = 'https://github.com/hulladev/api/tree/main'

const pages = {
  'architecture.md': {
    destination: 'reference/architecture.mdx',
    title: 'Architecture',
    description:
      'Trace a contract from declaration through client transport, server execution, and response decoding.',
  },
  'contract-authoring.md': {
    destination: 'core/contracts.mdx',
    title: 'Contracts',
    description:
      'Declare paths, request representations, response statuses, and shared schemas without server implementation code.',
  },
  'server-authoring.md': {
    destination: 'core/servers.mdx',
    title: 'Server implementations',
    description:
      'Implement a contract exhaustively, scope middleware and context, then expose a complete server or deployable fragment.',
  },
  'client-authoring.md': {
    destination: 'core/clients.mdx',
    title: 'Typed clients',
    description:
      'Create a contract-shaped client, choose a transport, narrow declared responses, and add request middleware.',
  },
  'request-transport.md': {
    destination: 'core/request-transport.mdx',
    title: 'Request representations',
    description:
      'Understand how parameters, query values, headers, bodies, and native JSON cross a transport boundary.',
  },
  'value-round-trips.md': {
    destination: 'core/value-round-trips.mdx',
    title: 'Values across boundaries',
    description:
      'Choose native JSON, one-way schemas, transforms, or codecs based on the value each side should receive.',
  },
  'errors.md': {
    destination: 'core/errors.mdx',
    title: 'Errors',
    description:
      'Model declared application failures separately from validation, transport, implementation, and runtime failures.',
  },
  // start/migration.mdx is intentionally curated in this site so it can pair
  // the upstream migration reference with an interactive before/after diff.
  'plugins.md': {
    destination: 'integrations/query-libraries.mdx',
    title: 'TanStack Query & SWR',
    description:
      'Derive cache keys and executable query or mutation options from an existing typed client.',
  },
  'openapi.md': {
    destination: 'integrations/openapi.mdx',
    title: 'OpenAPI',
    description:
      'Export contracts to OpenAPI or generate a runtime contract and typed documentation sidecar from an existing document.',
  },
  'message-port.md': {
    destination: 'transports/message-port.mdx',
    title: 'MessagePort',
    description:
      'Run the same contract across workers, Electron, or another ordered IPC endpoint with cancellation and streaming.',
  },
  'websocket.md': {
    destination: 'transports/websocket.mdx',
    title: 'WebSocket',
    description:
      'Carry contract calls and response streams over a WebSocket while preserving typed responses and cancellation.',
  },
  'desktop-bridges.md': {
    destination: 'transports/desktop-bridges.mdx',
    title: 'Desktop bridges',
    description:
      'Connect MessagePort semantics to Electron, Tauri, Dioxus, or a JSON-only desktop bridge.',
  },
  'hybrid-rendering.md': {
    destination: 'full-stack/hybrid-rendering.mdx',
    title: 'Hybrid rendering',
    description:
      'Keep server-only implementations out of browser bundles while choosing zero-hop or Fetch clients per render boundary.',
  },
  'adapter-conformance.md': {
    destination: 'reference/adapter-conformance.mdx',
    title: 'Adapter behavior',
    description:
      'Compare routing, parsing, streaming, context, and lifecycle ownership across every supported host adapter.',
  },
  'runtime-hosts.md': {
    destination: 'runtimes/runtime-hosts.mdx',
    title: 'Bun, Deno & Vercel',
    description:
      'Choose the Fetch or Node boundary that fits Bun, Deno, and Vercel runtime deployments.',
  },
  'node-http.md': {
    destination: 'servers/node-http.mdx',
    title: 'Node.js HTTP',
    description:
      'Mount a contract on the native Node HTTP server with streaming backpressure and native request context.',
  },
  'express.md': {
    destination: 'servers/express.mdx',
    title: 'Express',
    description:
      'Register compiled contract routes in Express while retaining Express request and response context.',
  },
  'fastify.md': {
    destination: 'servers/fastify.mdx',
    title: 'Fastify',
    description:
      'Register native Fastify routes with typed request, reply, hooks, and plugin encapsulation.',
  },
  'hono.md': {
    destination: 'servers/hono.mdx',
    title: 'Hono',
    description:
      'Mount native Hono routes and make bindings, variables, and context available to server handlers.',
  },
  'h3.md': {
    destination: 'servers/h3.mdx',
    title: 'H3',
    description:
      'Mount native H3 routes with event context and middleware across H3-supported runtimes.',
  },
  'elysia.md': {
    destination: 'servers/elysia.mdx',
    title: 'Elysia',
    description:
      'Register native Elysia routes while preserving lifecycle state, decorators, and stores.',
  },
  'koa.md': {
    destination: 'servers/koa.mdx',
    title: 'Koa',
    description:
      'Mount an exhaustive implementation as Koa middleware with native context and streaming responses.',
  },
  'nestjs.md': {
    destination: 'servers/nestjs.mdx',
    title: 'NestJS',
    description:
      'Integrate a contract with Nest controllers, dependency injection, and either Express or Fastify platforms.',
  },
  'next.md': {
    destination: 'full-stack/next.mdx',
    title: 'Next.js',
    description:
      'Use App Router handlers, server-side clients, Data Cache policies, Server Actions, and browser Fetch clients.',
  },
  'tanstack-start.md': {
    destination: 'full-stack/tanstack-start.mdx',
    title: 'TanStack Start',
    description:
      'Mount contract-backed server routes and call them through loaders, server functions, or browser clients.',
  },
  'react-router.md': {
    destination: 'full-stack/react-router.mdx',
    title: 'React Router',
    description:
      'Serve a contract through Framework Mode resource routes and consume it from loaders and actions.',
  },
  'solid-start.md': {
    destination: 'full-stack/solid-start.mdx',
    title: 'SolidStart',
    description:
      'Mount a catch-all API route and consume the same contract through server queries or browser Fetch.',
  },
  'sveltekit.md': {
    destination: 'full-stack/sveltekit.mdx',
    title: 'SvelteKit',
    description:
      'Use catch-all endpoints, enhanced Fetch, or zero-hop remote functions with native RequestEvent context.',
  },
  'nuxt.md': {
    destination: 'full-stack/nuxt.mdx',
    title: 'Nuxt',
    description:
      'Mount a Nitro route and build a request-aware client for useAsyncData, events, and server handlers.',
  },
  'astro.md': {
    destination: 'full-stack/astro.mdx',
    title: 'Astro',
    description:
      'Serve a contract from an Astro endpoint and choose in-process or Fetch calls for components and islands.',
  },
  'cloudflare.md': {
    destination: 'runtimes/cloudflare.mdx',
    title: 'Cloudflare',
    description:
      'Deploy to Module Workers or Pages Functions with native bindings, execution context, and asset fallback.',
  },
  'aws-lambda.md': {
    destination: 'runtimes/aws-lambda.mdx',
    title: 'AWS Lambda',
    description:
      'Serve a contract through API Gateway HTTP API v2 or a Lambda Function URL.',
  },
  'azure-functions.md': {
    destination: 'runtimes/azure-functions.mdx',
    title: 'Azure Functions',
    description:
      'Register an Azure Functions v4 HTTP trigger while preserving invocation context and native response values.',
  },
  'google-cloud-functions.md': {
    destination: 'runtimes/google-cloud-functions.mdx',
    title: 'Google Cloud Run functions',
    description:
      'Register a Functions Framework HTTP function with native context and streaming response support.',
  },
  'netlify-functions.md': {
    destination: 'runtimes/netlify-functions.mdx',
    title: 'Netlify Functions',
    description:
      'Expose a contract as a Web-native Netlify Function with platform context and deployment configuration.',
  },
}

const destinationForSource = new Map(
  Object.entries(pages).map(([source, page]) => [
    source,
    page.destination.replace(/\.mdx$/, ''),
  ])
)

for (const [source, page] of Object.entries(pages)) {
  const sourcePath = path.join(apiRoot, 'docs', source)
  const targetPath = path.join(docsRoot, page.destination)
  const raw = await readFile(sourcePath, 'utf8')
  const body = transformMarkdown(raw, source)
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(page.title)}`,
    `description: ${JSON.stringify(page.description)}`,
    '---',
    '',
  ].join('\n')

  await mkdir(path.dirname(targetPath), { recursive: true })
  await writeFile(targetPath, `${frontmatter}${body.trim()}\n`)
}

console.log(
  `Synced ${Object.keys(pages).length} @hulla/api guides from ${apiRoot}.`
)

function transformMarkdown(markdown, source) {
  const withoutTitle = markdown.replace(/^# .+\n+/, '')

  return withoutTitle.replace(/\]\((\.\.?\/[^)]+)\)/g, (match, target) => {
    const [pathname, fragment = ''] = target.split('#')
    const resolved = path.posix.normalize(
      path.posix.join(path.posix.dirname(source), pathname)
    )
    const docsDestination = destinationForSource.get(resolved)
    if (docsDestination) {
      return `](/docs/api/${docsDestination}${fragment ? `#${fragment}` : ''})`
    }

    const repositoryPath = path.posix.normalize(
      path.posix.join('docs', path.posix.dirname(source), pathname)
    )
    return `](${repositoryUrl}/${repositoryPath}${fragment ? `#${fragment}` : ''})`
  })
}
