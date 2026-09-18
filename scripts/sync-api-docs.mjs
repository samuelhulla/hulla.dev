import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const siteRoot = process.cwd()
const apiRoot = path.resolve(process.env.HULLA_API_ROOT ?? '../api')
const docsRoot = path.join(siteRoot, 'src/content/docs/api')
const sourceRef = process.env.HULLA_API_REF ?? 'master'
const repositoryUrl = `https://github.com/hulladev/api/tree/${encodeURIComponent(sourceRef)}`

const pages = {
  'architecture.md': {
    destination: 'reference/architecture.mdx',
    title: 'Contract compiler',
    description:
      'Inspect the immutable route manifest used by adapters and tooling.',
  },
  'contract-authoring.md': {
    destination: 'core/contracts.mdx',
    title: 'Contracts',
    description:
      'Define the shared paths, inputs, and status-specific responses that type both servers and clients.',
  },
  'server-authoring.md': {
    destination: 'core/servers.mdx',
    title: 'Server implementations',
    description:
      'Implement every contract route, mount the result, and inspect a real response.',
  },
  'server-context.md': {
    destination: 'core/server-context.mdx',
    title: 'Server context and middleware',
    description:
      'Create request-scoped context and apply middleware globally or to selected routes.',
  },
  'server-composition.md': {
    destination: 'core/server-composition.mdx',
    title: 'Server fragments and composition',
    description:
      'Split handlers into typed modules or independently mountable fragments, then compose a complete implementation.',
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
  'control.md': {
    destination: 'integrations/control.mdx',
    title: 'Result-returning clients',
    description:
      'Convert typed client outcomes into @hulla/control Result values without losing declared response types.',
  },
  'migration.md': {
    destination: 'reference/migration.mdx',
    title: '2.0 migration reference',
    description:
      'Look up removed APIs, package moves, client and server replacements, and runtime behavior changes in @hulla/api 2.0.',
  },
  // start/migration.mdx remains intentionally curated so it can provide a
  // short migration journey with an interactive before/after diff. The
  // canonical migration.md above supplies the exhaustive reference page.
  'plugins.md': {
    destination: 'integrations/query-libraries.mdx',
    title: 'Query library integrations',
    description:
      'Choose who owns browser cache and query state around an existing typed client.',
  },
  'tanstack-query.md': {
    destination: 'integrations/tanstack-query.mdx',
    title: 'TanStack Query',
    description:
      'Create typed TanStack Query v5 keys and options, then invalidate the correct contract route.',
  },
  'swr.md': {
    destination: 'integrations/swr.mdx',
    title: 'SWR',
    description:
      'Create typed SWR keys and fetchers, run mutations, and revalidate the correct contract route.',
  },
  'openapi.md': {
    destination: 'integrations/openapi.mdx',
    title: 'OpenAPI',
    description:
      'Choose whether a code-first contract or an existing OpenAPI document owns the API description.',
  },
  'openapi-export.md': {
    destination: 'integrations/openapi/export.mdx',
    title: 'Export a contract to OpenAPI',
    description:
      'Generate a JSON or YAML OpenAPI document from a runtime contract and typed documentation sidecar.',
  },
  'openapi-import.md': {
    destination: 'integrations/openapi/import.mdx',
    title: 'Import an OpenAPI document',
    description:
      'Generate a runtime contract and typed sidecar from a provider-owned OpenAPI document.',
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
    title: 'Choose a transport for each render boundary',
    description:
      'Choose local, framework-native, or HTTP calls without leaking server implementations into browser bundles.',
  },
  'adapter-conformance.md': {
    destination: 'reference/adapter-conformance.mdx',
    title: 'Adapter behavior',
    description:
      'Compare how @hulla/api adapters handle routes, request bodies, responses, errors, and cancellation.',
  },
  'runtime-hosts.md': {
    destination: 'runtimes/runtime-hosts.mdx',
    title: 'Web-native runtimes',
    description:
      'Choose how Bun, Deno, or Vercel should expose the same Fetch-compatible contract handler.',
  },
  'bun.md': {
    destination: 'runtimes/bun.mdx',
    title: 'Bun',
    description:
      'Serve an @hulla/api contract directly from Bun with a Web-standard request handler.',
  },
  'deno.md': {
    destination: 'runtimes/deno.mdx',
    title: 'Deno',
    description:
      'Serve an @hulla/api contract through deno serve or an application-owned Deno listener.',
  },
  'vercel.md': {
    destination: 'runtimes/vercel.mdx',
    title: 'Vercel Functions',
    description:
      'Expose an @hulla/api contract from a standalone Vercel Function using the Web Handler API.',
  },
  'node-http.md': {
    destination: 'servers/node-http.mdx',
    title: 'Node.js HTTP',
    description:
      'Turn a contract implementation into a Node HTTP listener with explicit body, stream, and server ownership.',
  },
  'express.md': {
    destination: 'servers/express.mdx',
    title: 'Express',
    description:
      'Mount contract routes on an existing Express app or Router with host-owned middleware and body parsing.',
  },
  'fastify.md': {
    destination: 'servers/fastify.mdx',
    title: 'Fastify',
    description:
      'Mount contract routes in the Fastify plugin scope that owns their hooks, parsers, decorators, and prefix.',
  },
  'hono.md': {
    destination: 'servers/hono.mdx',
    title: 'Hono',
    description:
      "Mount contract routes in Hono's middleware flow with cached request bodies and typed native context.",
  },
  'h3.md': {
    destination: 'servers/h3.mdx',
    title: 'H3',
    description:
      'Mount contract routes on an H3 v2 app with native middleware, event context, and explicit request-body ownership.',
  },
  'elysia.md': {
    destination: 'servers/elysia.mdx',
    title: 'Elysia',
    description:
      'Register contract routes on a caller-owned Elysia app with native lifecycle hooks and typed extensions.',
  },
  'koa.md': {
    destination: 'servers/koa.mdx',
    title: 'Koa',
    description:
      'Mount contract routes as terminal Koa middleware with typed state, native context, and host-owned parsing.',
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
      'Mount an @hulla/api implementation in an App Router Route Handler with native Next request context.',
  },
  'next-data.md': {
    destination: 'full-stack/next-data.mdx',
    title: 'Next.js data and caching',
    description:
      'Apply typed Next Data Cache policy and tags, invalidate server data, and keep browser caches separate.',
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
      'Mount a Framework Mode resource route and choose HTTP or colocated calls from loaders and actions.',
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
      'Mount catch-all endpoints, verify the HTTP boundary, and consume it with enhanced Fetch.',
  },
  'sveltekit-remote-functions.md': {
    destination: 'full-stack/sveltekit-remote-functions.mdx',
    title: 'SvelteKit remote functions',
    description:
      'Run contract calls inside SvelteKit query, command, or form callbacks without a second Fetch request.',
  },
  'nuxt.md': {
    destination: 'full-stack/nuxt.mdx',
    title: 'Nuxt',
    description:
      'Mount a Nitro route and use a request-aware client with useAsyncData and browser events.',
  },
  'astro.md': {
    destination: 'full-stack/astro.mdx',
    title: 'Astro',
    description:
      'Serve a contract from an Astro endpoint and choose in-process or Fetch calls for components and islands.',
  },
  'cloudflare.md': {
    destination: 'runtimes/cloudflare.mdx',
    title: 'Cloudflare Workers',
    description:
      'Mount contract routes in a Module Worker fetch handler with typed bindings and Web response ownership.',
  },
  'cloudflare-pages.md': {
    destination: 'runtimes/cloudflare-pages.mdx',
    title: 'Cloudflare Pages Functions',
    description:
      'Mount a contract beneath a Pages file route while keeping API misses separate from asset fallback.',
  },
  'aws-lambda.md': {
    destination: 'runtimes/aws-lambda.mdx',
    title: 'AWS Lambda',
    description:
      'Mount a buffered Lambda proxy handler for API Gateway payload v2 or a Function URL.',
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
      'Mount a Functions Framework HTTP entrypoint with raw-body decoding, native context, and response streaming.',
  },
  'netlify-functions.md': {
    destination: 'runtimes/netlify-functions.mdx',
    title: 'Netlify Functions',
    description:
      'Mount a contract under a Netlify function path with native context and Web responses.',
  },
}

const destinationForSource = new Map(
  Object.entries(pages).map(([source, page]) => [
    source,
    page.destination.replace(/\.mdx$/, ''),
  ])
)

// Read every guide before changing any destination so an incomplete release
// cannot leave a partially imported documentation tree.
const guides = await Promise.all(
  Object.entries(pages).map(async ([source, page]) => ({
    source,
    page,
    raw: await readFile(path.join(apiRoot, 'docs', source), 'utf8'),
  }))
)

for (const { source, page, raw } of guides) {
  const targetPath = path.join(docsRoot, page.destination)
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

if (process.env.HULLA_API_RELEASE) {
  await mkdir(path.join(siteRoot, '.hulla'), { recursive: true })
  await writeFile(
    path.join(siteRoot, '.hulla/docs.json'),
    `${JSON.stringify({ api: { release: process.env.HULLA_API_RELEASE, commit: sourceRef } }, null, 2)}\n`
  )
}

console.log(
  `Synced ${Object.keys(pages).length} @hulla/api guides from ${apiRoot}.`
)

function transformMarkdown(markdown, source) {
  const withoutTitle = markdown.replace(/^# .+\n+/, '')
  const packageManager = transformPackageManagerCommands(withoutTitle)
  const alerts = transformAlerts(packageManager.body)

  const transformed = alerts.body
    .replace(/\]\((\.\.?\/[^)]+)\)/g, (match, target) => {
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
    .replace(/\]\(https:\/\/hulla\.dev(\/docs\/api\/[^)]+)\)/g, ']($1)')

  const imports = [packageManager.importStatement, ...alerts.imports].filter(
    Boolean
  )
  return imports.length > 0
    ? `${imports.join('\n')}\n\n${transformed}`
    : transformed
}

function transformPackageManagerCommands(markdown) {
  // Canonical Markdown keeps all four commands readable; the site renders the
  // marked block through the shared, persisted package-manager tabs.
  const pattern =
    /<!-- docs:package-manager -->\n+```sh\n# Bun\n([^\n]+)\n\n# npm\n([^\n]+)\n\n# pnpm\n([^\n]+)\n\n# Yarn\n([^\n]+)\n```/
  let found = false
  const body = markdown.replace(pattern, (_match, bun, npm, pnpm, yarn) => {
    found = true
    return [
      '<DocsPackageManagerCommand',
      '  commands={{',
      `    bun: ${JSON.stringify(bun)},`,
      `    npm: ${JSON.stringify(npm)},`,
      `    pnpm: ${JSON.stringify(pnpm)},`,
      `    yarn: ${JSON.stringify(yarn)},`,
      '  }}',
      '/>',
    ].join('\n')
  })

  return {
    body,
    importStatement: found
      ? `import DocsPackageManagerCommand from '@/components/docs/DocsPackageManagerCommand.astro'`
      : '',
  }
}

function transformAlerts(markdown) {
  const warningPattern = /^> \[!WARNING\]\n> \*\*(.+)\*\*\n>\n> (.+)$/gm
  let foundWarning = false
  const body = markdown.replace(
    warningPattern,
    (_match, title, description) => {
      foundWarning = true
      const alertDescription = description.replace(
        /`([^`]+)`/g,
        '<code>$1</code>'
      )
      return [
        '<Alert variant="warning" role="alert">',
        '  <AlertIcon><TriangleAlert /></AlertIcon>',
        `  <AlertTitle>${title}</AlertTitle>`,
        `  <AlertDescription>${alertDescription}</AlertDescription>`,
        '</Alert>',
      ].join('\n')
    }
  )

  return {
    body,
    imports: foundWarning
      ? [
          `import Alert from '@/components/alert/alert.astro'`,
          `import AlertDescription from '@/components/alert/alert-description.astro'`,
          `import AlertIcon from '@/components/alert/alert-icon.astro'`,
          `import AlertTitle from '@/components/alert/alert-title.astro'`,
          `import { TriangleAlert } from '@lucide/astro'`,
        ]
      : [],
  }
}
