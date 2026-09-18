import { describe, expect, test } from 'bun:test'
import { access, readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { apiCoverage } from '../src/data/api-coverage'
import { apiDocNavigation, apiDocs, flatApiDocs } from '../src/data/docs'
import { remarkDocsCode } from '../src/lib/remark-docs-code'
import {
  cleanMdxForAgents,
  renderMarkdownDocument,
} from '../src/lib/docs-markdown'
import { renderDocGroupMarkdown } from '../src/lib/doc-group-markdown'
import { stripInlineCode, tokenizeInlineCode } from '../src/lib/inline-code'
const root = join(import.meta.dir, '..')
describe('documentation integrity', () => {
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
    for (const entry of flatApiDocs) {
      const suffix = entry.href.slice('/docs/api'.length)
      await access(
        join(
          root,
          'src/content/docs/api',
          suffix ? `${suffix}.mdx` : 'index.mdx'
        )
      )
    }
    expect(new Set(apiDocs.map((group) => group.href)).size).toBe(
      apiDocs.length
    )
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
  test('long learning-path examples provide a visual reading cue', async () => {
    const violations: string[] = []
    const directories = ['start', 'core', 'transports']

    for (const directory of directories) {
      const path = join(root, 'src/content/docs/api', directory)
      for (const filename of await readdir(path)) {
        if (!filename.endsWith('.mdx')) continue

        const source = await readFile(join(path, filename), 'utf8')
        const fences = source.matchAll(/^```([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm)

        for (const fence of fences) {
          const metadata = fence[1] ?? ''
          const code = fence[2] ?? ''
          const lines = code.split('\n').length
          const hasReadingCue =
            /^(?:diff)(?:\s|$)/.test(metadata) ||
            /(?:^|\s)(?:focus|ins|del|error|warning)=\{/.test(metadata) ||
            /(?:^|\s)\{[\d,\s-]+\}/.test(metadata)

          if (lines >= 18 && !hasReadingCue)
            violations.push(`${directory}/${filename} (${lines} lines)`)
        }
      }
    }

    expect(violations).toEqual([])
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
  })
  test('site styles do not target shared component parts or descendants of prose containers', async () => {
    const css = await readFile(join(root, 'src/styles/site.css'), 'utf8')
    expect(css).not.toContain('[data-slot')
    expect(css).not.toMatch(/\.docs-content\s+[^,{]+\{/)
    expect(css).not.toMatch(/\.md-(?:p|blockquote|li)\s+[^,{]+\{/)
  })
})
