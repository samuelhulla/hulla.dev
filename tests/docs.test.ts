import { describe, expect, test } from 'bun:test'
import { access, readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { apiCoverage } from '../src/data/api-coverage'
import {
  adjacentDocs,
  apiDocNavigation,
  apiDocs,
  docGroups,
  docPackages,
  findDocPackage,
  flatDocs,
  flatApiDocs,
} from '../src/data/docs'
import { createShikiCodeHighlighter } from '../src/components/code-highlighter-shiki/code-highlighter-shiki'
import { remarkDocsCode } from '../src/lib/remark-docs-code'
import {
  cleanMdxForAgents,
  renderMarkdownDocument,
} from '../src/lib/docs-markdown'
import { renderDocGroupMarkdown } from '../src/lib/doc-group-markdown'
import { stripInlineCode, tokenizeInlineCode } from '../src/lib/inline-code'
const root = join(import.meta.dir, '..')
describe('documentation integrity', () => {
  test('diff lines retain their source-language syntax highlighting', async () => {
    const source =
      "-import { api } from '@hulla/api'\n+import { defineContract } from '@hulla/api'"
    const highlighter = await createShikiCodeHighlighter({ languages: ['ts'] })
    const result = highlighter.highlightDiff(source, { language: 'ts' })

    expect(
      result.lines.map((line) =>
        line.tokens.map((token) => token.content).join('')
      )
    ).toEqual(source.split('\n'))
    expect(result.lines[0]?.tokens[0]).toMatchObject({
      color: 'var(--color-danger)',
      content: '-',
    })
    expect(result.lines[1]?.tokens[0]).toMatchObject({
      color: 'var(--color-success)',
      content: '+',
    })
    expect(
      new Set(result.lines[1]?.tokens.slice(1).map((token) => token.color)).size
    ).toBeGreaterThan(1)
  })

  test('metadata strips Markdown while descriptions retain code semantics', () => {
    const source = 'Use the `hulla` CLI.'
    expect(stripInlineCode(source)).toBe('Use the hulla CLI.')
    expect(tokenizeInlineCode(source)).toEqual([
      { kind: 'text', value: 'Use the ' },
      { kind: 'code', value: 'hulla' },
      { kind: 'text', value: ' CLI.' },
    ])
  })
  test('every documented route has a collection entry and a shared route renderer', async () => {
    await access(join(root, 'src/pages/docs/[...slug].astro'))
    for (const entry of flatDocs) {
      const suffix = entry.href.slice('/docs/'.length)
      const isLanding = findDocPackage(entry.href)?.href === entry.href
      await access(
        join(
          root,
          'src/content/docs',
          isLanding ? `${suffix}/index.mdx` : `${suffix}.mdx`
        )
      )
    }
    const routes = [...flatDocs, ...docGroups].map((item) => item.href)
    expect(new Set(routes).size).toBe(routes.length)
    for (const name of ['control', 'style', 'db', 'cli', 'args']) {
      const files = (
        await readdir(join(root, 'src/content/docs', name), { recursive: true })
      )
        .filter((file) => file.endsWith('.mdx'))
        .map(
          (file) =>
            `/docs/${name}${file === 'index.mdx' ? '' : `/${file.slice(0, -4)}`}` as const
        )
        .sort()
      expect(
        flatDocs
          .filter(
            (entry) =>
              entry.href === `/docs/${name}` ||
              entry.href.startsWith(`/docs/${name}/`)
          )
          .map((entry) => entry.href)
          .sort()
      ).toEqual(files)
    }
  })
  test('package navigation keeps pagination inside each package and resolves nested routes', () => {
    for (const pkg of docPackages) {
      const pages = pkg.groups.flatMap((group) => group.entries)
      if (pages.length === 0) continue
      expect(adjacentDocs(pages[0]!.href).previous).toBeUndefined()
      expect(adjacentDocs(pages.at(-1)!.href).next).toBeUndefined()
      for (const page of pages) {
        expect(findDocPackage(page.href)?.href).toBe(pkg.href)
      }
    }
    expect(findDocPackage('/docs/stylesheet')).toBeUndefined()
  })
  test('sidebar navigation groups server and client concepts without hiding integrations', () => {
    const server = apiDocNavigation.find(
      (section) => section.title === 'Server'
    )!
    const client = apiDocNavigation.find(
      (section) => section.title === 'Client'
    )!
    const integrations = apiDocNavigation.find(
      (section) => section.title === 'Integrations'
    )!

    expect(server.groups.map((group) => group.title)).toEqual([
      'Server adapters',
      'Full-stack frameworks',
      'Serverless',
    ])
    expect(client.groups.map((group) => group.title)).toEqual([
      'Client connections',
    ])
    expect(integrations.groups.map((group) => group.title)).toEqual([
      'Integrations',
    ])
    expect(apiDocNavigation.flatMap((section) => section.groups)).toEqual([
      ...apiDocs,
    ])
  })
  test('coverage destinations exist and exports are unique per entrypoint', () => {
    const routes = new Set(flatApiDocs.map((entry) => entry.href))
    const seen = new Set<string>()
    for (const item of apiCoverage) {
      expect(routes.has(item.page)).toBe(true)
      for (const name of item.exports) {
        const key = `${item.entrypoint}:${name}`
        expect(seen.has(key)).toBe(false)
        seen.add(key)
      }
    }
  })
  test('fenced code preserves source and language, including JSX-sensitive characters', () => {
    type Tree = Parameters<ReturnType<typeof remarkDocsCode>>[0]
    const source = '  const value = `<tag>${input} & "text"`\n    return value'
    const tree: Tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'code',
              lang: 'ts',
              meta: 'filename="example.ts"',
              value: source,
            },
          ],
        },
      ],
    }
    remarkDocsCode()(tree)
    const node = tree.children?.[1]?.children?.[0]
    expect(node?.type).toBe('mdxJsxFlowElement')
    expect(node?.attributes).toEqual([
      { type: 'mdxJsxAttribute', name: 'code', value: source },
      { type: 'mdxJsxAttribute', name: 'language', value: 'ts' },
      { type: 'mdxJsxAttribute', name: 'filename', value: 'example.ts' },
    ])
    expect(tree.children?.[0]?.type).toBe('mdxjsEsm')
  })
  test('documents without fences do not gain an unnecessary component import', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
      ],
    }
    const before = structuredClone(tree)
    remarkDocsCode()(tree)
    expect(tree).toEqual(before)
  })
  test('language-tab fences share the containing code frame while ordinary fences keep theirs', () => {
    type Tree = Parameters<ReturnType<typeof remarkDocsCode>>[0]
    const tree: Tree = {
      type: 'root',
      children: [
        {
          type: 'mdxJsxFlowElement',
          name: 'DocsLanguageTabs',
          children: [
            {
              type: 'mdxJsxFlowElement',
              name: 'section',
              children: [
                { type: 'code', lang: 'rust', value: 'let value = 1;' },
              ],
            },
          ],
        },
        { type: 'code', lang: 'ts', value: 'const value = 1' },
      ],
    }
    remarkDocsCode()(tree)
    const embedded = tree.children?.[1]?.children?.[0]?.children?.[0]
    const ordinary = tree.children?.[2]
    expect(embedded?.attributes).toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'embedded',
      value: null,
    })
    expect(ordinary?.attributes).not.toContainEqual({
      type: 'mdxJsxAttribute',
      name: 'embedded',
      value: null,
    })
  })
  test('fenced code forwards line focus and state metadata', () => {
    type Tree = Parameters<ReturnType<typeof remarkDocsCode>>[0]
    const tree: Tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'ts',
          meta: '{2-3} focus={1-4} ins={3} del={1} error={4} warning={2} lineNumbers',
          value: 'one\ntwo\nthree\nfour',
        },
      ],
    }

    remarkDocsCode()(tree)

    const attributes = (
      tree.children?.[1] as { attributes?: unknown[] } | undefined
    )?.attributes

    expect(attributes?.slice(2)).toEqual([
      { type: 'mdxJsxAttribute', name: 'highlighted', value: '2-3' },
      { type: 'mdxJsxAttribute', name: 'focused', value: '1-4' },
      { type: 'mdxJsxAttribute', name: 'inserted', value: '3' },
      { type: 'mdxJsxAttribute', name: 'deleted', value: '1' },
      { type: 'mdxJsxAttribute', name: 'error', value: '4' },
      { type: 'mdxJsxAttribute', name: 'warning', value: '2' },
      { type: 'mdxJsxAttribute', name: 'lineNumbers', value: null },
    ])
  })
  test('code emphasis stays sparse and limited to deliberate teaching moments', async () => {
    const emphasizedFences: string[] = []
    const directories = ['start', 'core', 'transports']

    for (const directory of directories) {
      const path = join(root, 'src/content/docs/api', directory)
      for (const filename of await readdir(path)) {
        if (!filename.endsWith('.mdx')) continue

        const source = await readFile(join(path, filename), 'utf8')
        const fences = source.matchAll(/^```([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm)

        for (const fence of fences) {
          const metadata = fence[1] ?? ''
          const hasEmphasis =
            /(?:^|\s)(?:focus|error|warning)=\{/.test(metadata) ||
            /(?:^|\s)\{[\d,\s-]+\}/.test(metadata)

          if (hasEmphasis)
            emphasizedFences.push(`${directory}/${filename}: ${metadata}`)
        }
      }
    }

    expect(emphasizedFences.sort()).toEqual([
      'core/request-transport.mdx: ts filename="src/api/contract.ts" {6,10,14,18}',
      'core/servers.mdx: ts filename="src/api/server.ts" {4,6}',
      'transports/desktop-bridges.mdx: ts filename="src/api/desktop-relay.ts" focus={15-29,32,34-37}',
      'transports/desktop-bridges.mdx: ts filename="src/api/dioxus-eval-script.ts" focus={6-10,13,15-18}',
      'transports/desktop-bridges.mdx: ts filename="src/api/tauri-client.ts" focus={10-16,18,21,23-26}',
      'transports/message-port.mdx: ts filename="src/api/message-port-demo.ts" focus={23-32}',
      'transports/websocket.mdx: ts filename="src/api/websocket-demo.ts" focus={33-44}',
    ])
  })
  test('AI Markdown removes presentation-only MDX and targets Markdown siblings', () => {
    const output = renderMarkdownDocument({
      title: 'Example',
      description: 'Machine-readable documentation.',
      usefulFor: ['Testing AI navigation.'],
      body: `import DocsPackageManagerCommand from '@/component.astro'

Read the [guide](/docs/api/quick-start).

<DocsPackageManagerCommand commands={{ bun: 'bun add example' }} />`,
    })

    expect(output).toContain('# Example')
    expect(output).toContain('https://hulla.dev/docs/api/quick-start.md')
    expect(output).toContain('```sh\nbun add example\n```')
    expect(output).not.toContain('import DocsPackageManagerCommand')
    expect(output).not.toContain('<DocsPackageManagerCommand')
  })
  test('AI Markdown retains guide-list labels, descriptions, and destinations', () => {
    const output =
      cleanMdxForAgents(`<DocsGuideLinks label="Next steps" items={[
      { title: 'Quick start', href: '/docs/api/quick-start', description: 'Build a working route.' },
      { title: 'Reference', href: '/docs/api/reference', description: 'Look up an export.' },
    ]} />`)

    expect(output).toContain(
      '[Quick start](https://hulla.dev/docs/api/quick-start.md)'
    )
    expect(output).toContain('Build a working route.')
    expect(output).toContain(
      '[Reference](https://hulla.dev/docs/api/reference.md)'
    )
    expect(output).not.toContain('DocsGuideLinks')
  })
  test('AI Markdown preserves Alert meaning as a blockquote', () => {
    const output = cleanMdxForAgents(`<Alert variant="warning" role="alert">
  <AlertIcon><TriangleAlert /></AlertIcon>
  <AlertTitle>Import replaces both generated files</AlertTitle>
  <AlertDescription><code>hulla-openapi import</code> overwrites both targets.</AlertDescription>
</Alert>`)

    expect(output).toBe(
      '> **Import replaces both generated files**\n>\n> `hulla-openapi import` overwrites both targets.'
    )
  })
  test('AI Markdown preserves ordered Stepper instructions', () => {
    const output = cleanMdxForAgents(`<Stepper variant="ordered">
  <StepperItem id="install-core" data-toc-section data-toc-label="Install core">
    <StepperIndicator>1</StepperIndicator>
    <StepperContent><DocsStepperHeading for="install-core">Install core</DocsStepperHeading><StepperDescription>Start small.</StepperDescription></StepperContent>
    <StepperPanel>
      Run this command.
      <DocsPackageManagerCommand commands={{ bun: 'bun add @hulla/api' }} />
    </StepperPanel>
  </StepperItem>
</Stepper>`)

    expect(output).toContain('**Install core** — Start small.')
    expect(output).toContain('Run this command.')
    expect(output).toContain('```sh\nbun add @hulla/api\n```')
    expect(output).not.toContain('Stepper')
  })
  test('AI Markdown keeps both language-tab samples as labeled fences', () => {
    const source = [
      '<DocsLanguageTabs>',
      '  <section slot="typescript">',
      '',
      '```ts',
      'const value = 1',
      '```',
      '',
      '  </section>',
      '  <section slot="rust">',
      '',
      '```rust',
      'let value = 1;',
      '```',
      '',
      '  </section>',
      '</DocsLanguageTabs>',
    ].join('\n')
    const output = cleanMdxForAgents(source)

    expect(output).toContain('**TypeScript**\n\n```ts\nconst value = 1\n```')
    expect(output).toContain('**Rust**\n\n```rust\nlet value = 1;\n```')
    expect(output).not.toContain('DocsLanguageTabs')
    expect(output).not.toContain('slot=')
  })
  test('group Markdown preserves chooser and ordinary page structure', () => {
    const transports = apiDocs.find(
      (group) => group.href === '/docs/api/transports'
    )!
    const start = apiDocs.find(
      (group) => group.href === '/docs/api/start-here'
    )!

    expect(renderDocGroupMarkdown(transports)).toContain(
      '## Choose how the client connects'
    )
    expect(renderDocGroupMarkdown(transports)).toContain(
      '| Connection | Choose it when |'
    )
    expect(renderDocGroupMarkdown(transports)).toContain('## Guides')
    expect(renderDocGroupMarkdown(start).startsWith('## Guides')).toBe(true)
    expect(renderDocGroupMarkdown(start)).not.toContain(
      '## Choose how the client connects'
    )
  })
  test('AI Markdown fails loudly when a visual component lacks a fallback', () => {
    expect(() => cleanMdxForAgents('<NewDiagram />')).toThrow(
      'Add an AI Markdown fallback for the NewDiagram MDX component.'
    )
    expect(() =>
      cleanMdxForAgents(
        '<DocsLanguageTabs><section slot="typescript">\n\n```ts\nlet value = 1\n```\n\n</section></DocsLanguageTabs>'
      )
    ).toThrow(
      'DocsLanguageTabs requires a non-empty rust slot for AI Markdown.'
    )
  })
  test('site styles do not target shared component parts or descendants of prose containers', async () => {
    const css = await readFile(join(root, 'src/styles/site.css'), 'utf8')
    expect(css).not.toContain('[data-slot')
    expect(css).not.toMatch(/\.docs-content\s+[^,{]+\{/)
    expect(css).not.toMatch(/\.md-(?:p|blockquote|li)\s+[^,{]+\{/)
  })
})
