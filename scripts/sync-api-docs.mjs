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
    description: 'Inspect a contract as a flat list of routes.',
  },
  'contract-authoring.md': {
    destination: 'core/contracts.mdx',
    title: 'Contracts',
    description:
      'Define the routes, inputs, and responses that your server and client share.',
  },
  'server-authoring.md': {
    destination: 'core/servers.mdx',
    title: 'Server implementations',
    description:
      'Write handlers for your contract and call the finished server.',
  },
  'server-context.md': {
    destination: 'core/server-context.mdx',
    title: 'Server context and middleware',
    description:
      'Share request data between handlers and add checks with middleware.',
  },
  'server-composition.md': {
    destination: 'core/server-composition.mdx',
    title: 'Server fragments and composition',
    description:
      'Split a large API into smaller handler files or separately mounted fragments.',
  },
  'client-authoring.md': {
    destination: 'core/clients.mdx',
    title: 'Typed clients',
    description:
      'Call your API with typed input and handle the response by status.',
  },
  'request-transport.md': {
    destination: 'core/request-transport.mdx',
    title: 'Request representations',
    description:
      'Turn URL parameters, headers, and request bodies into values your handlers can use.',
  },
  'value-round-trips.md': {
    destination: 'core/value-round-trips.mdx',
    title: 'Values across boundaries',
    description:
      'Choose how values such as dates and URLs travel between your client and server.',
  },
  'errors.md': {
    destination: 'core/errors.mdx',
    title: 'Errors',
    description: 'Handle expected API errors and diagnose unexpected failures.',
  },
  'control.md': {
    destination: 'integrations/control.mdx',
    title: 'Result-returning clients',
    description:
      'Handle client responses as Ok and Err values from @hulla/control.',
  },
  'migration.md': {
    destination: 'reference/migration.mdx',
    title: '2.0 migration reference',
    description:
      'Find the 2.0 replacements for 1.x imports, methods, and behavior.',
  },
  // start/migration.mdx remains intentionally curated so it can provide a
  // short migration journey with an interactive before/after diff. The
  // canonical migration.md above supplies the exhaustive reference page.
  'plugins.md': {
    destination: 'integrations/query-libraries.mdx',
    title: 'Query library integrations',
    description:
      'Add caching and loading states to your API client with TanStack Query or SWR.',
  },
  'tanstack-query.md': {
    destination: 'integrations/tanstack-query.mdx',
    title: 'TanStack Query',
    description:
      'Load API data with TanStack Query and invalidate it after a mutation.',
  },
  'swr.md': {
    destination: 'integrations/swr.mdx',
    title: 'SWR',
    description: 'Load API data with SWR and refresh it after a mutation.',
  },
  'openapi.md': {
    destination: 'integrations/openapi.mdx',
    title: 'OpenAPI',
    description:
      'Export your contract to OpenAPI or generate a contract from an existing document.',
  },
  'openapi-export.md': {
    destination: 'integrations/openapi/export.mdx',
    title: 'Export a contract to OpenAPI',
    description:
      'Generate an OpenAPI document that other tools and teams can use.',
  },
  'openapi-import.md': {
    destination: 'integrations/openapi/import.mdx',
    title: 'Import an OpenAPI document',
    description:
      'Create a typed client contract from an existing OpenAPI document.',
  },
  'message-port.md': {
    destination: 'transports/message-port.mdx',
    title: 'MessagePort',
    description:
      'Call your API in a worker or another process through a message channel.',
  },
  'websocket.md': {
    destination: 'transports/websocket.mdx',
    title: 'WebSocket',
    description: 'Send typed API calls and response streams over a WebSocket.',
  },
  'desktop-bridges.md': {
    destination: 'transports/desktop-bridges.mdx',
    title: 'Desktop bridges',
    description:
      'Call your API through an Electron, Tauri, or Dioxus message bridge.',
  },
  'hybrid-rendering.md': {
    destination: 'full-stack/hybrid-rendering.mdx',
    title: 'Choose a transport for each render boundary',
    description:
      'Set up a client for the browser and another for code that runs on the server.',
  },
  'adapter-conformance.md': {
    destination: 'reference/adapter-conformance.mdx',
    title: 'Adapter behavior',
    description:
      'Compare routing, body parsing, errors, and cancellation across server adapters.',
  },
  'runtime-hosts.md': {
    destination: 'runtimes/runtime-hosts.mdx',
    title: 'Web-native runtimes',
    description: 'Connect a Fetch handler to Bun, Deno, or Vercel.',
  },
  'bun.md': {
    destination: 'runtimes/bun.mdx',
    title: 'Bun',
    description: 'Run your API with Bun.serve().',
  },
  'deno.md': {
    destination: 'runtimes/deno.mdx',
    title: 'Deno',
    description: 'Run your API with deno serve or Deno.serve().',
  },
  'vercel.md': {
    destination: 'runtimes/vercel.mdx',
    title: 'Vercel Functions',
    description: 'Run your API as a standalone Vercel Function.',
  },
  'node-http.md': {
    destination: 'servers/node-http.mdx',
    title: 'Node.js HTTP',
    description: 'Run your API with Node\u2019s built-in HTTP server.',
  },
  'express.md': {
    destination: 'servers/express.mdx',
    title: 'Express',
    description: 'Add your API routes to an Express app or Router.',
  },
  'fastify.md': {
    destination: 'servers/fastify.mdx',
    title: 'Fastify',
    description: 'Register your API routes in a Fastify app.',
  },
  'hono.md': {
    destination: 'servers/hono.mdx',
    title: 'Hono',
    description: 'Add your API routes to a Hono app.',
  },
  'h3.md': {
    destination: 'servers/h3.mdx',
    title: 'H3',
    description: 'Add your API routes to an H3 v2 app.',
  },
  'elysia.md': {
    destination: 'servers/elysia.mdx',
    title: 'Elysia',
    description: 'Add your API routes to an Elysia app.',
  },
  'koa.md': {
    destination: 'servers/koa.mdx',
    title: 'Koa',
    description: 'Serve your API inside a Koa middleware stack.',
  },
  'nestjs.md': {
    destination: 'servers/nestjs.mdx',
    title: 'NestJS',
    description: 'Register your API routes as Nest controller methods.',
  },
  'next.md': {
    destination: 'full-stack/next.mdx',
    title: 'Next.js',
    description: 'Serve your API from a Next.js App Router Route Handler.',
  },
  'next-data.md': {
    destination: 'full-stack/next-data.mdx',
    title: 'Next.js data and caching',
    description:
      'Cache API requests on the Next.js server and refresh them after a write.',
  },
  'tanstack-start.md': {
    destination: 'full-stack/tanstack-start.mdx',
    title: 'TanStack Start',
    description: 'Serve your API from a TanStack Start server route.',
  },
  'react-router.md': {
    destination: 'full-stack/react-router.mdx',
    title: 'React Router',
    description: 'Expose your API through a React Router resource route.',
  },
  'solid-start.md': {
    destination: 'full-stack/solid-start.mdx',
    title: 'SolidStart',
    description:
      'Add a SolidStart API route and call it from queries, actions, or the browser.',
  },
  'sveltekit.md': {
    destination: 'full-stack/sveltekit.mdx',
    title: 'SvelteKit',
    description:
      'Serve your API from a SvelteKit endpoint and call it from load.',
  },
  'sveltekit-remote-functions.md': {
    destination: 'full-stack/sveltekit-remote-functions.mdx',
    title: 'SvelteKit remote functions',
    description:
      'Call your API inside SvelteKit remote functions without an extra HTTP request.',
  },
  'nuxt.md': {
    destination: 'full-stack/nuxt.mdx',
    title: 'Nuxt',
    description: 'Serve an API with Nitro and load its data in a Nuxt page.',
  },
  'astro.md': {
    destination: 'full-stack/astro.mdx',
    title: 'Astro',
    description:
      'Add an API endpoint to Astro and call it from a page or browser island.',
  },
  'cloudflare.md': {
    destination: 'runtimes/cloudflare.mdx',
    title: 'Cloudflare Workers',
    description:
      'Serve your API from a Cloudflare Worker and use its bindings.',
  },
  'cloudflare-pages.md': {
    destination: 'runtimes/cloudflare-pages.mdx',
    title: 'Cloudflare Pages Functions',
    description: 'Add your API to a Cloudflare Pages Functions project.',
  },
  'aws-lambda.md': {
    destination: 'runtimes/aws-lambda.mdx',
    title: 'AWS Lambda',
    description:
      'Serve your API through API Gateway HTTP API or a Lambda Function URL.',
  },
  'azure-functions.md': {
    destination: 'runtimes/azure-functions.mdx',
    title: 'Azure Functions',
    description: 'Register your API as an Azure Functions v4 HTTP trigger.',
  },
  'google-cloud-functions.md': {
    destination: 'runtimes/google-cloud-functions.mdx',
    title: 'Google Cloud Run functions',
    description: 'Register your API as a Google Cloud HTTP function.',
  },
  'netlify-functions.md': {
    destination: 'runtimes/netlify-functions.mdx',
    title: 'Netlify Functions',
    description: 'Serve your API from a Netlify web request function.',
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
