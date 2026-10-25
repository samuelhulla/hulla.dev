import type { DocPackage } from './docs'

type PackagePreview = {
  purpose: string
  summary: string
  headline: string
  description: string
  useCase: string
  caption: string
  code: string
  language: 'ts' | 'sh'
  demo?: DocPackage['kind']
}

export const packagePreviews: Record<DocPackage['kind'], PackagePreview> = {
  api: {
    purpose: 'HTTP contracts',
    summary:
      'Type-check HTTP requests, handlers, and clients against one shared contract, across the hosts and transports your app uses.',
    headline: 'Catch broken API calls when you change the contract.',
    description:
      'Declare methods, inputs, and response statuses in a shared contract. TypeScript checks the handlers and callers against it, whether you use Fetch, Express, Hono, or an in-process call.',
    useCase: 'APIs shared by web apps, services, and desktop processes.',
    caption:
      'Edit the contract, server, or caller in the code editor. A real TypeScript worker checks every change; shortcuts can load a breaking or repaired project.',
    demo: 'api',
    language: 'ts',
    code: `import { defineContract, route, response } from '@hulla/api'

export const contract = defineContract({
  routes: {
    profile: route.get('/profile', {
      responses: { 200: response.json<{ displayName: string }>() },
    }),
  },
})`,
  },
  ui: {
    purpose: 'Interface components',
    summary:
      'Editable components for Astro, React, and Solid, with the same tokens, variants, and interaction rules.',
    headline: 'Keep your design system when your framework changes.',
    description:
      'Keep one set of design tokens, component variants, and interaction rules across three frameworks. Install the source into your app, then change it alongside your own code.',
    useCase: 'Product teams sharing a design system across different apps.',
    caption:
      'Use the shipped form. Add tasks, complete them, and try keyboard focus and disabled states.',
    demo: 'ui',
    language: 'ts',
    code: '',
  },
  gittar: {
    demo: 'gittar',
    purpose: 'Repository downloads',
    summary:
      'Copy a repository folder into a starter project, with a separate cache and an explicit refresh policy.',
    headline: 'One template repository. As many editable starters as you need.',
    description:
      'Download a repository snapshot and copy just the folder your tool needs. Keep the cache separate from editable files, and choose when to reuse it or check the remote.',
    useCase: 'Starter generators, template catalogs, and build scripts.',
    caption:
      'Edit the download options, copy a starter, and customize it. Use another destination to copy from the untouched template cache.',
    language: 'ts',
    code: `import gittar from '@hulla/gittar'

const snapshot = await gittar({
  url: 'hulladev/gittar',
  branch: 'master',
  subpath: 'src',
  update: 'commit',
  outDir: './my-starter',
})`,
  },
  control: {
    demo: 'control',
    purpose: 'Typed results',
    summary:
      'Return typed success or failure values so callers can handle expected errors before transforming the result.',
    headline: 'Catch a bad deployment config before the next step runs.',
    description:
      'Return ok(data) or err(problem) for expected failures. Narrow the branch, transform its payload, or match both outcomes; the success and error types stay visible to the caller.',
    useCase:
      'Missing records, invalid input, and recoverable application errors.',
    caption:
      'Break the JSON or supply an invalid replica count. Both become typed failures; later work stays unreached.',
    language: 'ts',
    code: `import { tcf, err, ok } from '@hulla/control'

const parsed = tcf({
  try: () => JSON.parse(source) as unknown,
  catch: () => new Error('Invalid JSON'),
})
if (parsed.isErr()) return parsed
// Validate the shape before building the deployment plan.
// Return err(problem) for domain failures, ok(plan) on success.`,
  },
  style: {
    purpose: 'Class composition',
    summary:
      'Define class variants once and infer the component props from their keys, in any framework.',
    headline: 'One styling pipeline. Every variant and override follows it.',
    description:
      'An override should follow the same rules inside a variant and at the component boundary. Create cn() and vn() from one processor, compose independent variants, and infer props from their keys. One policy across your codebase.',
    useCase: 'Typed size, tone, and state props in any component framework.',
    caption:
      'Edit the actual style module. Preview three consumers, inspect composition output, and measure 10,000 calls to your compose() function.',
    demo: 'style',
    language: 'ts',
    code: `import { style } from '@hulla/style'
import { cn as mergeClasses } from 'cn'

export const { cn, vn } = style({ composer: mergeClasses })
const $space = vn({ roomy: ['px-2', 'px-4'] })

$space('roomy') // 'px-4'
cn($space('roomy'), 'px-6') // 'px-6'
type Space = typeof $space.infer // 'roomy'`,
  },
  db: {
    purpose: 'PostgreSQL & live queries',
    summary:
      'Read and write your own PostgreSQL database with a typed SDK, and refresh subscribed browser queries after committed writes.',
    headline: 'Update PostgreSQL. Let subscribed views update with it.',
    description:
      'Use a typed SDK on the server and declared queries in the browser. After a write commits, affected queries rerun and publish their results. Keep your PostgreSQL database, framework, and auth provider.',
    useCase:
      'Dashboards and collaborative views backed by your own PostgreSQL.',
    caption:
      'Edit the database table or the client storefront. Writes pass through a server model, commit, and publish to a separate subscribed view.',
    demo: 'db',
    language: 'ts',
    code: `import { query } from './_generated/functions'

export const list = query((ctx) =>
  ctx.db
    .select('tasks')
    .limit(100)
)`,
  },
  cli: {
    demo: 'cli',
    purpose: 'Project tooling',
    summary:
      'Copy UI components into your project as editable source, then review updates through the same CLI.',
    headline: 'Need to change the component? Open the source in your app.',
    description:
      'Choose a registry and a framework, then copy the component and its support files into your app. Review the diff, customize the source, and manage later updates from the same CLI.',
    useCase:
      'Installing @hulla/ui and repeating component workflows across projects.',
    caption:
      'Edit the install command and see the source files in its install plan. The preview supports Astro, React, and Solid button and dialog components.',
    language: 'sh',
    code: `# Record your project settings
hulla init

# Configure your component source
hulla ui init
hulla ui add --framework astro button`,
  },
  args: {
    demo: 'args',
    purpose: 'Argument parsing',
    summary:
      'Parse flags, positionals, and nested commands into typed values, with Zod validation and access to the raw input.',
    headline: 'Reject --port nope before starting your preview server.',
    description:
      'Declare flags, options, positionals, and nested commands. Parse their values with Zod validation while keeping raw input and detection metadata available for your own error messages.',
    useCase:
      'Developer tools that need validated input and control over their output.',
    caption:
      'Type a bad port, omit it, or add a flag. Real parsing distinguishes invalid input from absence before your handler runs.',
    language: 'ts',
    code: `import { parser, option } from '@hulla/args'
import { z } from 'zod'

const cli = parser({
  name: 'preview',
  arguments: [
    option({ name: 'port', schema: z.coerce.number().int().min(1).max(65535) }),
  ],
})
const port = cli.parse(['--port', '8080']).arguments.port
port.value // number: 8080
port.detected // true`,
  },
}
