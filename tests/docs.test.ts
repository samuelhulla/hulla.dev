import { describe, expect, test } from 'bun:test'
import {
  adjacentDocs,
  docPackages,
  findDocPackage,
  type DocGroup,
} from '../src/data/docs'
import { remarkDocsCallouts } from '../src/lib/remark-docs-callouts'
import { remarkDocsCode } from '../src/lib/remark-docs-code'
import {
  cleanMdxForAgents,
  renderMarkdownDocument,
} from '../src/lib/docs-markdown'
import { renderDocGroupMarkdown } from '../src/lib/doc-group-markdown'
import { stripInlineCode, tokenizeInlineCode } from '../src/lib/inline-code'
import { guides, findGuide, adjacentGuides } from '../src/data/guides'
describe('documentation transforms and navigation', () => {
  test('metadata strips Markdown while descriptions retain code semantics', () => {
    const source = 'Use the `hulla` CLI.'
    expect(stripInlineCode(source)).toBe('Use the hulla CLI.')
    expect(tokenizeInlineCode(source)).toEqual([
      { kind: 'text', value: 'Use the ' },
      { kind: 'code', value: 'hulla' },
      { kind: 'text', value: ' CLI.' },
    ])
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
    const docsPaths = new Set<string>(
      docPackages.flatMap((pkg) =>
        pkg.groups.flatMap((group) => group.entries.map((entry) => entry.href))
      )
    )
    for (const guide of guides) {
      expect(docsPaths.has(guide.href)).toBe(false)
      expect(docsPaths.has(`/docs/${guide.id}`)).toBe(false)
      expect(findGuide(`${guide.href}/`)).toEqual(guide)
      const adjacent = adjacentGuides(guide.href)
      for (const page of [adjacent.previous, adjacent.next]) {
        if (page) expect(page.packageKind).toBe(guide.packageKind)
      }
    }
  })
  test('callouts preserve content and leave ordinary blockquotes alone', () => {
    const link = {
      type: 'link',
      url: '/docs/api',
      children: [{ type: 'text', value: 'contract' }],
    }
    const ordinary = {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'An ordinary quote.' }],
        },
      ],
    }
    const tree = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: '[!WARNING] Keep secrets on the server\nRead the ',
                },
                link,
              ],
            },
          ],
        },
        ordinary,
      ],
    }
    remarkDocsCallouts()(tree)
    expect(tree.children[1]).toMatchObject({
      name: 'DocsCallout',
      attributes: [
        { name: 'kind', value: 'warning' },
        { name: 'title', value: 'Keep secrets on the server' },
      ],
      children: [
        { name: 'p', children: [{ type: 'text', value: 'Read the ' }, link] },
      ],
    })
    expect(tree.children[2]).toEqual(ordinary)
  })
  test('tutorial prerequisites stay available in the Markdown edition', () => {
    const output = renderMarkdownDocument({
      title: 'Build a demo',
      description: 'A complete example.',
      body: 'Start here.',
      tutorial: {
        outcome: 'A saved note.',
        prerequisites: [
          { title: 'Install the parser', href: '/guides/args/quick-start' },
        ],
      },
    })
    expect(output).toContain("## What you'll build")
    expect(output).toContain('A saved note.')
    expect(output).toContain(
      '[Install the parser](https://hulla.dev/guides/args/quick-start.md)'
    )
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
  test('AI Markdown removes presentation-only MDX and targets Markdown siblings', () => {
    const output = renderMarkdownDocument({
      title: 'Example',
      description: 'Machine-readable documentation.',
      usefulFor: ['Testing AI navigation.'],
      body: `import DocsPackageManagerCommand from '@/component.astro'

Read the [guide](/guides/api/quick-start).

<DocsPackageManagerCommand commands={{ bun: 'bun add example' }} />`,
    })

    expect(output).toContain('# Example')
    expect(output).toContain('https://hulla.dev/guides/api/quick-start.md')
    expect(output).toContain('```sh\nbun add example\n```')
    expect(output).not.toContain('import DocsPackageManagerCommand')
    expect(output).not.toContain('<DocsPackageManagerCommand')
  })
  test('AI Markdown preserves the meaning and boundaries of package simulations', () => {
    const api = cleanMdxForAgents('<PackageDemoFrame kind="api" />')
    const db = cleanMdxForAgents('<PackageDemoFrame kind="db" />')
    expect(api).toContain('makes no network request to an API')
    expect(api).toContain('real TypeScript compiler')
    expect(api).toContain('response.json')
    expect(api).toContain('preset edit, not a live AI agent')
    expect(api).toContain('https://hulla.dev/guides/api/quick-start.md')
    expect(db).toContain('does not connect to PostgreSQL')
    expect(db).toContain('https://hulla.dev/guides/db/quick-start.md')
    expect(db).not.toContain('<PackageDemoFrame')
    for (const kind of ['style', 'ui', 'control', 'args', 'gittar', 'cli']) {
      const output = cleanMdxForAgents(`<PackageDemoFrame kind="${kind}" />`)
      expect(output).toContain('Interactive example:')
      expect(output).not.toContain('<PackageDemoFrame')
    }
  })
  test('AI Markdown retains guide-list labels, descriptions, and destinations', () => {
    const output =
      cleanMdxForAgents(`<DocsGuideLinks label="Next steps" items={[
      { title: 'Quick start', href: '/guides/api/quick-start', description: 'Build a working route.' },
      { title: 'Reference', href: '/docs/api/reference', description: 'Look up an export.' },
    ]} />`)

    expect(output).toContain(
      '[Quick start](https://hulla.dev/guides/api/quick-start.md)'
    )
    expect(output).toContain('Build a working route.')
    expect(output).toContain(
      '[Reference](https://hulla.dev/docs/api/reference.md)'
    )
    expect(output).not.toContain('DocsGuideLinks')
  })
  test('Markdown callouts preserve their type, links, and code without MDX', () => {
    const output = cleanMdxForAgents(
      '> [!TIP] Check the result\n> Read [Results](/docs/control/results) before calling `unwrap()`.'
    )
    expect(output).toContain('> **Tip: Check the result**')
    expect(output).toContain(
      '[Results](https://hulla.dev/docs/control/results.md)'
    )
    expect(output).toContain('`unwrap()`')
    expect(output).not.toContain('[!TIP]')
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
    const group: DocGroup = {
      title: 'Connections',
      href: '/docs/example/connections',
      description: 'Pick a connection.',
      entries: [
        {
          title: 'HTTP',
          href: '/docs/example/http',
          description: 'Send requests.',
          chooseWhen: 'Crossing a network.',
          applicationOwns: 'The HTTP server.',
        },
      ],
    }

    expect(renderDocGroupMarkdown(group)).toBe(
      '## Documentation\n\n- [HTTP](https://hulla.dev/docs/example/http.md): Send requests.'
    )
    expect(renderDocGroupMarkdown({ ...group, area: 'reference' })).toStartWith(
      '## Reference pages'
    )
    expect(
      renderDocGroupMarkdown({ ...group, chooserTitle: 'Choose a connection' })
    ).toContain(
      '| [HTTP](https://hulla.dev/docs/example/http.md) | Crossing a network. | The HTTP server. |'
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
})
